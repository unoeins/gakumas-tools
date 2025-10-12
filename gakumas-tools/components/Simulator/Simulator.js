"use client";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslations } from "next-intl";
import { Tooltip } from "react-tooltip";
import {
  IdolConfig,
  StageConfig,
  SimulatorConfig,
  IdolStageConfig,
  STRATEGIES,
} from "gakumas-engine";
import Button from "@/components/Button";
import Input from "@/components/Input";
import KofiAd from "@/components/KofiAd";
import Loader from "@/components/Loader";
import LoadoutSkillCardGroup from "@/components/LoadoutSkillCardGroup";
import ParametersInput from "@/components/ParametersInput";
import SimulatorResult from "@/components/SimulatorResult";
import StagePItems from "@/components/StagePItems";
import StageSelect from "@/components/StageSelect";
import LoadoutContext from "@/contexts/LoadoutContext";
import WorkspaceContext from "@/contexts/WorkspaceContext";
import { simulate } from "@/simulator";
import { MAX_WORKERS, DEFAULT_NUM_RUNS, SYNC } from "@/simulator/constants";
import { logEvent } from "@/utils/logging";
import {
  bucketScores,
  getMedianScore,
  mergeResults,
  getIndications,
} from "@/utils/simulator";
import { formatStageShortName } from "@/utils/stages";
import SimulatorButtons from "./SimulatorButtons";
import SimulatorSubTools from "./SimulatorSubTools";
import styles from "./Simulator.module.scss";
import SkillCardOrderGroups from "@/components/SkillCardOrderGroups";
import TurnTypeOrder from "@/components/TurnTypeOrder";
import SimulatorUseStats from "@/components/SimulatorUseStats";
import SimulatorPriorityStats from "@/components/SimulatorPriorityStats";

export default function Simulator() {
  const t = useTranslations("Simulator");

  const {
    stage,
    loadout,
    simulatorUrl,
    setSupportBonus,
    setParams,
    replacePItemId,
    swapPItemIds,
    setRemovedCardOrder,
    pushLoadoutHistory,
  } = useContext(LoadoutContext);
  const { plan, idolId } = useContext(WorkspaceContext);
  const [strategy, setStrategy] = useState("HeuristicStrategy");
  const [simulatorData, setSimulatorData] = useState(null);
  const [running, setRunning] = useState(false);
  const [numRuns, setNumRuns] = useState(DEFAULT_NUM_RUNS);
  const [enableSkillCardOrder, setEnableSkillCardOrder] = useState(false);
  const [enableUseStats, setEnableUseStats] = useState(true);
  const [useStatsData, setUseStatsData] = useState(null);
  const [enablePriorityStats, setEnablePriorityStats] = useState(false);
  const [priorityStatsData, setPriorityStatsData] = useState(null);
  const workersRef = useRef();

  const config = useMemo(() => {
    const idolConfig = new IdolConfig(loadout);
    const stageConfig = new StageConfig(stage);
    const simulatorConfig = new SimulatorConfig({enableSkillCardOrder, enableUseStats, enablePriorityStats});
    return new IdolStageConfig(idolConfig, stageConfig, simulatorConfig);
  }, [loadout, stage, enableSkillCardOrder, enableUseStats, enablePriorityStats]);

  const { pItemIndications, skillCardIndicationGroups } = getIndications(
    config,
    loadout
  );

  // Set up web workers on mount
  useEffect(() => {
    let numWorkers = 1;
    if (navigator.hardwareConcurrency) {
      numWorkers = Math.min(navigator.hardwareConcurrency, MAX_WORKERS);
    }
    setNumRuns(Math.floor((numWorkers * 250) / 200) * 200);

    workersRef.current = [];
    for (let i = 0; i < numWorkers; i++) {
      workersRef.current.push(
        new Worker(new URL("../../simulator/worker.js", import.meta.url))
      );
    }

    return () => workersRef.current?.forEach((worker) => worker.terminate());
  }, []);

  const setResult = useCallback(
    (result) => {
      const { bucketedScores, bucketSize } = bucketScores(result.scores);
      const medianScore = getMedianScore(result.scores);

      console.timeEnd("simulation");

      setSimulatorData({ bucketedScores, medianScore, bucketSize, ...result });
      setUseStatsData(result.listenerData["UseStats"]);
      setPriorityStatsData(result.listenerData["PriorityStats"]);
      setRunning(false);
    },
    [setSimulatorData, setRunning]
  );

  function runSimulation() {
    setRunning(true);

    console.time("simulation");

    if (SYNC || !workersRef.current || numRuns < 100) {
      const result = simulate(config, strategy, numRuns);
      console.log("Simulation result:", result);
      setResult(result);
    } else {
      const numWorkers = workersRef.current.length;
      const runsPerWorker = Math.floor(numRuns / numWorkers);
      const extraRuns = numRuns - numWorkers * runsPerWorker;

      let promises = [];
      for (let i = 0; i < numWorkers; i++) {
        promises.push(
          new Promise((resolve) => {
            workersRef.current[i].onmessage = (e) => resolve(e.data);
            workersRef.current[i].postMessage({
              idolStageConfig: config,
              strategyName: strategy,
              numRuns: i == 0 ? runsPerWorker + extraRuns : runsPerWorker
            });
          })
        );
      }

      Promise.all(promises).then((results) => {
        const mergedResults = mergeResults(results);
        setResult(mergedResults);
        pushLoadoutHistory();

        logEvent("simulator.simulate", {
          stageId: stage.id,
          idolId: config.idol.idolId,
          page_location: simulatorUrl,
          minScore: mergedResults.minRun.score,
          averageScore: mergedResults.averageScore,
          maxScore: mergedResults.maxRun.score,
        });
      });
    }
  }

  return (
    <div id="simulator_loadout" className={styles.loadoutEditor}>
      <div className={styles.configurator}>
        <div>{t("multiplierNote")}</div>
        {stage.preview && <div>{t("previewNote")}</div>}
        <StageSelect />
        {stage.type == "event" ? (
          t("enterPercents")
        ) : (
          <div className={styles.supportBonusInput}>
            <label>{t("supportBonus")}</label>
            <Input
              type="number"
              value={parseFloat(((loadout.supportBonus || 0) * 100).toFixed(2))}
              onChange={(value) =>
                setSupportBonus(parseFloat((value / 100).toFixed(4)))
              }
            />
          </div>
        )}
        <div className={styles.params}>
          <ParametersInput
            parameters={loadout.params}
            onChange={setParams}
            withStamina
            max={10000}
          />
          <div className={styles.typeMultipliers}>
            {Object.keys(config.typeMultipliers).map((param) => (
              <div key={param}>
                {Math.round(config.typeMultipliers[param] * 100)}%
              </div>
            ))}
            <div />
          </div>
        </div>
        <div className={styles.pItemsRow}>
          <div className={styles.pItems}>
            <StagePItems
              pItemIds={loadout.pItemIds}
              replacePItemId={replacePItemId}
              swapPItemIds={swapPItemIds}
              indications={pItemIndications}
              size="medium"
            />
          </div>
          <span>{formatStageShortName(stage, t)}</span>
        </div>
        {loadout.skillCardIdGroups.map((skillCardIdGroup, i) => (
          <LoadoutSkillCardGroup
            key={i}
            skillCardIds={skillCardIdGroup}
            customizations={loadout.customizationGroups[i]}
            indications={skillCardIndicationGroups[i]}
            groupIndex={i}
            idolId={config.idol.idolId || idolId}
          />
        ))}
        <SimulatorSubTools defaultCardIds={config.defaultCardIds} />
        <select
          className={styles.strategySelect}
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
        >
          {Object.keys(STRATEGIES).map((strategy) => (
            <option key={strategy} value={strategy}>
              {strategy}
            </option>
          ))}
        </select>
        <input
          type="range"
          value={numRuns}
          onChange={(e) => setNumRuns(parseInt(e.target.value, 10))}
          min={1}
          max={4000}
          step={1}
        />
        <Button style="blue" onClick={runSimulation} disabled={running}>
          {running ? <Loader /> : `${t("simulate")} (n=${numRuns})`}
        </Button>
        <SimulatorButtons />
        {/* <div className={styles.url}>{simulatorUrl}</div> */}
        <div className={styles.skillCardOrderToggle}>
          <input
            type="checkbox"
            id="enableSkillCardOrder"
            checked={enableSkillCardOrder}
            onChange={(e) => setEnableSkillCardOrder(e.target.checked)}
          />
          <label htmlFor="enableSkillCardOrder">{t("enableSkillCardOrder")}</label>
        </div>
        {enableSkillCardOrder && (
          <>
            <SkillCardOrderGroups
              skillCardIdOrderGroups={loadout.skillCardIdOrderGroups}
              customizationOrderGroups={loadout.customizationOrderGroups}
              idolId={config.idol.idolId || idolId}
              defaultCardIds={config.defaultCardIds}
              removedCardOrder={loadout.removedCardOrder}
              setRemovedCardOrder={setRemovedCardOrder}
            />
            <TurnTypeOrder
              turnTypeOrder={loadout.turnTypeOrder}
            />
          </>
        )}
        <div className={styles.useStatsToggle}>
          <input
            type="checkbox"
            id="enableUseStats"
            checked={enableUseStats}
            onChange={(e) => setEnableUseStats(e.target.checked)}
          />
          <label htmlFor="enableUseStats">{t("enableUseStats")}</label>
        </div>
        {/* <div className={styles.priorityStatsToggle}>
          <input
            type="checkbox"
            id="enablePriorityStats"
            checked={enablePriorityStats}
            onChange={(e) => setEnablePriorityStats(e.target.checked)}
          />
          <label htmlFor="enablePriorityStats">{t("enablePriorityStats")}</label>
        </div> */}
        {enableUseStats && useStatsData && (
          <SimulatorUseStats
            useStats={useStatsData}
            idolId={config.idol.idolId || idolId}
          />
        )}
        {enablePriorityStats && priorityStatsData && (
          <SimulatorPriorityStats
            priorityStats={priorityStatsData}
            idolId={config.idol.idolId || idolId}
          />
        )}
        <div className={styles.subLinks}>
          <a
            href={`https://docs.google.com/forms/d/e/1FAIpQLScNquedw8Lp2yVfZjoBFMjQxIFlX6-rkzDWIJTjWPdQVCJbiQ/viewform?usp=pp_url&entry.1787906485=${encodeURIComponent(
              simulatorUrl
            )}`}
            target="_blank"
          >
            {t("provideData")}
          </a>
          <a
            href="https://github.com/surisuririsu/gakumas-tools/blob/master/gakumas-tools/simulator/CHANGELOG.md"
            target="_blank"
          >
            {t("lastUpdated")}: 2025-10-09
          </a>
        </div>
        {!simulatorData && (
          <div className={styles.ad}>
            <KofiAd />
          </div>
        )}
      </div>

      {simulatorData && (
        <SimulatorResult
          data={simulatorData}
          idolId={config.idol.idolId || idolId}
          plan={config.idol.plan || plan}
        />
      )}

      <Tooltip id="indications-tooltip" />
    </div>
  );
}
