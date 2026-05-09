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
import { FaCircleArrowUp, FaArrowsRotate, FaHashtag, FaPercent } from "react-icons/fa6";
import {
  IdolConfig,
  StageEngine,
  StageConfig,
  SimulatorConfig,
  IdolStageConfig,
} from "gakumas-engine";
import PlayerStrategy from "gakumas-engine/strategies/PlayerStrategy";
import { S } from "gakumas-engine/constants";
import {
  deepCopy,
  isRandomBufferEnabled,
  enableRandomBuffer,
  disableRandomBuffer,
  resetRandomBuffer,
  flipRandomBuffer,
} from "gakumas-engine/utils";
import { structureLogs } from "@/utils/simulator";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import ButtonGroup from "@/components/ButtonGroup";
import Input from "@/components/Input";
import LoadoutEditor from "@/components/LoadoutEditor";
import LoadoutSummary from "@/components/LoadoutHistory/LoadoutSummary";
import Logs from "@/components/SimulatorLogs/Logs";
import TurnIndicator from "@/components/SimulatorLogs/TurnIndicator";
import StageSelect from "@/components/StageSelect";
import LoadoutContext from "@/contexts/LoadoutContext";
import SimulationRunsContext from "@/contexts/SimulationRunsContext";
import WorkspaceContext from "@/contexts/WorkspaceContext";
import ModalContext from "@/contexts/ModalContext";
import SimulatorButtons from "@/components/Simulator/SimulatorButtons";
import SimulatorSubTools from "@/components/Simulator/SimulatorSubTools";
import EntityIcon from "@/components/EntityIcon";
import HoldModal from "@/components/Simulator/HoldModal";
import { EntityTypes } from "@/utils/entities";
import StateViewer from "./StateViewer";
import EntitiesViewer from "./EntitiesViewer";
import styles from "./ContestPlayer.module.scss";

const LINK_PHASES = ["OP", "MID", "ED"];

export default function ContestPlayer() {
  const t = useTranslations("Simulator");
  const t2 = useTranslations("ContestPlayer");

  const {
    stage,
    loadout,
    simulatorUrl,
    setSupportBonus,
    loadouts,
    setLoadout,
    currentLoadoutIndex,
    setCurrentLoadoutIndex,
  } = useContext(LoadoutContext);
  const { pushRun } = useContext(SimulationRunsContext);

  const { plan, idolId } = useContext(WorkspaceContext);
  const [running, setRunning] = useState(false);
  const [enterPercents, setEnterPercents] = useState(false);
  const [listenerConfig, setListenerConfig] = useState({
    enableUseStats: false,
    enableConditionalUseStats: false,
    enablePriorityStats: false,
    enableScoreStats: false,
    enableSelectRandomCards: false,
  });
  const [stateHistory, setStateHistory] = useState([]);
  const [engine, setEngine] = useState(null);

  const config = useMemo(() => {
    const idolConfig = new IdolConfig(loadout);
    const stageConfig = new StageConfig(stage, loadout.startingEffects);
    const simulatorConfig = new SimulatorConfig({
      enableSkillCardOrder: loadout.enableSkillCardOrder,
      ...listenerConfig,
    });
    return new IdolStageConfig(idolConfig, stageConfig, enterPercents, simulatorConfig);
  }, [loadout, stage, enterPercents, listenerConfig]);

  const linkConfigs = useMemo(() => {
    if (stage.type !== "linkContest") return null;
    return loadouts.map((ld) => {
      const idolConfig = new IdolConfig(ld);
      const stageConfig = new StageConfig(stage, ld.startingEffects);
      const simulatorConfig = new SimulatorConfig({
        enableSkillCardOrder: ld.enableSkillCardOrder,
        ...listenerConfig,
      });
      return new IdolStageConfig(idolConfig, stageConfig, enterPercents, simulatorConfig);
    });
  }, [loadouts, stage, enterPercents, listenerConfig]);

  const { setModal, closeModal } = useContext(ModalContext);

  const logs = getState() ? engine?.logger.peekLogs(getState()) : null;
  const structuredLogs = useMemo(() => structureLogs(logs), [logs]);
  // if (logs) {
  //   console.log("logs:", logs);
  // }

  function getState() {
    return stateHistory.length > 0 ? stateHistory[stateHistory.length - 1] : null;
  }

  function pushState(newState) {
    setStateHistory((cur) => {
      const newHistory = cur ? [...cur, newState] : [newState];
      return newHistory;
    });
  }

  function popState() {
    const state = getState();
    setStateHistory((cur) => {
      if (!cur || cur.length === 0) return cur;
      const newHistory = cur.slice(0, cur.length - 1);
      return newHistory;
    });
    return state;
  }

  async function pickCardsToHold(state, cards, num = 1, optional = false, isRawId = false) {
    let selectedIndices = [];
    const promise = new Promise((resolve) => {
      setModal(
        <HoldModal
          decision={{
            state,
            cards,
            num,
            optional,
            isRawId,
            type: "HOLD_SELECTION",
          }}
          idolId={idolId}
          onDecision={(indices) => {
            resolve(indices);
            closeModal();
          }}
        />
      );
    }).then((indices) => {
      selectedIndices.push(...indices);
    });
    await promise;
    return selectedIndices;
  }

  async function executeDecision(engine, state, decision) {
    let nextState = null;
    let pickCardsToHoldIndices = [];
    engine.strategy.pickCardsToHoldIndices = [];
    enableRandomBuffer(state);
    resetRandomBuffer(state);
    while (nextState == null) {
      try {
        nextState = engine.executeDecision(state, decision);
      } catch (e) {
        if (e.message === "not picked") {
          const selectedIndices = await pickCardsToHold(
            e.args.state, e.args.cards, e.args.num, e.args.optional, e.args.isRawId
          );
          pickCardsToHoldIndices.push(selectedIndices);
          engine.strategy.pickCardsToHoldIndices = [...pickCardsToHoldIndices];
          flipRandomBuffer(state);
        } else {
          throw e;
        }
      }
    }
    disableRandomBuffer(state);
    resetRandomBuffer(state);
    return nextState;
  }

  async function startStage() {
    setStateHistory([]);
    setRunning(false);

    const run = pushRun({
      loadout,
      loadouts: stage.type === "linkContest" ? loadouts : null,
      scores: null,
    });

    const engine = new StageEngine(config, linkConfigs);
    engine.strategy = new PlayerStrategy(engine, pickCardsToHold);
  
    setEngine(engine);

    engine.logger.reset();
    const initialState = engine.getInitialState();
    initialState[S.runId] = run.id;
    const decision = { start: true };
    const nextState = await executeDecision(engine, initialState, decision);

    setStateHistory([nextState]);
    setRunning(true);
  }

  async function playCard(selectedIndex) {
    if (!running) return;
    const state = deepCopy(getState());
    const card = state[S.handCards][selectedIndex];
    if (!engine.isCardUsable(state, card)) {
      return;
    }
    const logIndex = engine.logger.log(state, "hand", null);
    const decision = { card };
    const nextState = await executeDecision(engine, state, decision);

    engine.logger.logs[logIndex].data = {
      handCards: state[S.handCards].map((card) => ({
        id: state[S.cardMap][card].id,
        c: state[S.cardMap][card].c11n,
      })),
      scores: Array(state[S.handCards].length).fill(0),
      selectedIndex,
      state: engine.logger.getHandStateForLogging(state),
    };

    pushState(nextState);
    if (nextState[S.turnsRemaining] <= 0) {
      setRunning(false);
    }
  }

  async function drink(selectedIndex) {
    if (!running) return;
    const state = deepCopy(getState());
    const decision = { drink: selectedIndex };
    const nextState = await executeDecision(engine, state, decision);

    pushState(nextState);
  }

  async function endTurn() {
    if (!running) return;
    const state = deepCopy(getState());
    const decision = { endTurn: true };
    const nextState = await executeDecision(engine, state, decision);

    pushState(nextState);
    if (nextState[S.turnsRemaining] <= 0) {
      setRunning(false);
    }
  }

  function undo() {
    if (stateHistory.length <= 1) return;
    const previousState = stateHistory[stateHistory.length - 2];
    popState();
    if (previousState[S.turnsRemaining] > 0) {
      setRunning(true);
    }
  }

  function getHandCardScores() {
    if (!running) return [];
    const state = getState();
    const prevEnabled = isRandomBufferEnabled(state);
    disableRandomBuffer(state);
    const scores = state[S.handCards].map((card) => {
      if (!engine.isCardUsable(state, card)) {
        return -Infinity;
      }
      const previewState = deepCopy(state);
      previewState[S.nullifySelect] = 1;
      previewState[S.effects] = [];
      previewState[S.score] = 0;
      
      // Set used card
      previewState[S.usedCard] = card;

      // Apply card cost
      const cost = engine.cardManager.getLines(previewState, card, "cost")
        .map((c) => c.actions)
        .flat();
      previewState[S.phase] = "processCost";
      engine.executor.executeActions(previewState, cost, card);
      delete previewState[S.phase];
      if (previewState[S.nullifyCostCards]) previewState[S.nullifyCostCards]--;

      // Apply card actions
      const actions = engine.cardManager.getLines(previewState, card, "actions");
      previewState[S.phase] = "processCard";

      engine.effectManager.triggerEffects(previewState, actions, null, card);
      return previewState[S.score];
    });
    if (prevEnabled) {
      enableRandomBuffer(state);
    }
    return scores;
  }

  function getTurnInfo() {
    const state = getState();
    let types = state[S.turnTypes];
    const totalTurns = state[S.turnsElapsed] + state[S.turnsRemaining];
    if (totalTurns > types.length) {
      types = [...types, ...Array(totalTurns - types.length).fill(types[types.length - 1])];
    }
    return {
      types: types,
      remaining: state[S.turnsRemaining],
      multiplier: engine.turnManager.getTurnMultiplier(state),
    };
  }

  return (
    <div id="simulator_loadout" className={styles.loadoutEditor}>
      <div className={styles.configurator}>
        {stage.preview && <Alert>{t("previewNote")}</Alert>}
        <StageSelect />
        {stage.type !== "contest" ? (
          <>
            <Alert>{t("enterPercents")}</Alert>
            {stage.type === "exam" && (
              <div className={styles.subLinks}>
                <a
                  href="https://forms.gle/Z8A6ML1kcWPwj8fS8"
                  target="_blank"
                >
                  {t2("requestForData")}
                </a>
              </div>
            )}
          </>
        ) : (
          <div className={styles.percentRow}>
            <ButtonGroup
              selected={enterPercents ? "percent" : "count"}
              options={[
                { value: "count", label: <FaHashtag /> },
                { value: "percent", label: <FaPercent /> },
              ]}
              onChange={(v) => setEnterPercents(v === "percent")}
            />
            {!enterPercents && (
              <div className={styles.supportBonusInput}>
                <label>{t("supportBonus")}</label>
                <Input
                  type="number"
                  value={parseFloat(
                    ((loadout.supportBonus || 0) * 100).toFixed(2)
                  )}
                  onChange={(value) =>
                    setSupportBonus(parseFloat((value / 100).toFixed(4)))
                  }
                />
              </div>
            )}
          </div>
        )}
        {stage.type == "linkContest" && (
          <Alert variant="warning">{t("linkContestNote")}</Alert>
        )}
        {stage.type == "linkContest" ? (
          <div className={styles.loadoutTabs}>
            {loadouts.map((loadout, index) => (
              <div key={index} className={styles.loadoutTab}>
                <button
                  className={styles.selectButton}
                  onClick={() => {
                    setLoadout(loadouts[index]);
                    setCurrentLoadoutIndex(index);
                  }}
                >
                  {LINK_PHASES[index]}
                </button>
                {index === currentLoadoutIndex ? (
                  <LoadoutEditor
                    config={config}
                    idolId={config.idol.idolId || idolId}
                  />
                ) : (
                  <div
                    className={styles.loadoutSummary}
                    onClick={() => {
                      setLoadout(loadouts[index]);
                      setCurrentLoadoutIndex(index);
                    }}
                  >
                    <LoadoutSummary loadout={loadout} showStage={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <LoadoutEditor
            config={config}
            idolId={config.idol.idolId || idolId}
          />
        )}

        <div data-export-hide="true">
          <SimulatorSubTools
            mode={"contestPlayer"}
            config={config}
            idolId={config.idol.idolId || idolId}
            listenerConfig={listenerConfig}
            setListenerConfig={setListenerConfig}
          />
        </div>

        <div data-export-hide="true">
          <Button
            style="blue"
            fill
            onClick={startStage}
          >
            {!running ? t2("startStage") : t2("restartStage")}
          </Button>
        </div>
        <SimulatorButtons />

        {getState() && (
          <div className={styles.playArea}>
            <div className={styles.infoArea}>
              <div className={styles.turnStateArea}>
                <div className={styles.turnIndicatorWrapper}>
                  <TurnIndicator turn={getTurnInfo()} />
                </div>
                <StateViewer
                  state={getState()}
                  idolId={config.idol.idolId || idolId}
                  plan={config.idol.plan || plan}
                />
              </div>
              <div className={styles.controls}>
                <div className={styles.cardPileCard}>
                  <EntityIcon
                    type={EntityTypes.SKILL_CARD}
                    id={0}
                    label={"UNDO"}
                    onClick={() => undo()}
                    idolId={idolId}
                    size={"fill"}
                  />
                </div>
              </div>
            </div>
            <EntitiesViewer
              state={getState()}
              type={EntityTypes.SKILL_CARD}
              name="handCards"
              scores={getHandCardScores()}
              onClick={(selectedIndex) => playCard(selectedIndex)}
              onSkip={() => endTurn()}
              idolId={config.idol.idolId || idolId}
              plan={config.idol.plan || plan}
              size="large"
            />
            {stage.type === "exam" && (
              <EntitiesViewer
                state={getState()}
                type={EntityTypes.P_DRINK}
                name="pDrinks"
                onClick={(selectedIndex) => drink(selectedIndex)}
                idolId={config.idol.idolId || idolId}
                plan={config.idol.plan || plan}
                size="middle"
              />
            )}
            {plan === "anomaly" && (
              <EntitiesViewer
                state={getState()}
                type={EntityTypes.SKILL_CARD}
                name="heldCards"
                reverse={true}
                idolId={config.idol.idolId || idolId}
                plan={config.idol.plan || plan}
                size="small"
              />
            )}
            <EntitiesViewer
              state={getState()}
              type={EntityTypes.SKILL_CARD}
              name="deckCards"
              reverse={true}
              idolId={config.idol.idolId || idolId}
              plan={config.idol.plan || plan}
              size="small"
            />
            <EntitiesViewer
              state={getState()}
              type={EntityTypes.SKILL_CARD}
              name="discardedCards"
              idolId={config.idol.idolId || idolId}
              plan={config.idol.plan || plan}
              size="small"
            />
            <EntitiesViewer
              state={getState()}
              type={EntityTypes.SKILL_CARD}
              name="removedCards"
              idolId={config.idol.idolId || idolId}
              plan={config.idol.plan || plan}
              size="small"
            />
          </div>
        )}
        <div className={styles.subLinks}>
          {/* <a
            href="https://github.com/surisuririsu/gakumas-tools/blob/master/gakumas-tools/simulator/CHANGELOG.md"
            target="_blank"
          >
            {t("lastUpdated")}: 2025-11-17
          </a> */}
        </div>
      </div>

      {logs && (
        <div className={styles.logsSection}>
          <div className={styles.content}>
            <label>{t2("logs")}</label>
            <Logs
              logs={structuredLogs}
              idolId={idolId}
            />
  
            <a className={styles.toTop} href="#simulator_loadout">
              Top
              <FaCircleArrowUp />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
