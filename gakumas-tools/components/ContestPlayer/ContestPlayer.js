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
import { deepCopy } from "gakumas-engine/utils";
import { structureLogs } from "@/utils/simulator";
import Button from "@/components/Button";
import IconButton from "@/components/IconButton";
import Input from "@/components/Input";
import LoadoutEditor from "@/components/LoadoutEditor";
import LoadoutSummary from "@/components/LoadoutHistory/LoadoutSummary";
import Logs from "@/components/SimulatorLogs/Logs";
import StageSelect from "@/components/StageSelect";
import LoadoutContext from "@/contexts/LoadoutContext";
import LoadoutHistoryContext from "@/contexts/LoadoutHistoryContext";
import WorkspaceContext from "@/contexts/WorkspaceContext";
import ModalContext from "@/contexts/ModalContext";
import SimulatorButtons from "@/components/Simulator/SimulatorButtons";
import SimulatorSubTools from "@/components/Simulator/SimulatorSubTools";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import TurnTypeViewer from "./TurnTypeViewer";
import StateViewer from "./StateViewer";
import EntitiesViewer from "./EntitiesViewer";
import HoldCardPickerModal from "./HoldCardPickerModal";
import SkillCardAndTurnTypeOrder from "@/components/SkillCardOrderGroups/SkillCardAndTurnTypeOrder";
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
    setEnableSkillCardOrder,
  } = useContext(LoadoutContext);
  const { pushLoadoutHistory, pushLoadoutsHistory } = useContext(
    LoadoutHistoryContext
  );
  const { plan, idolId } = useContext(WorkspaceContext);
  const [running, setRunning] = useState(false);
  const [enterPercents, setEnterPercents] = useState(false);
  const [stateHistory, setStateHistory] = useState([]);
  const [engine, setEngine] = useState(null);

  const config = useMemo(() => {
    const idolConfig = new IdolConfig(loadout);
    const stageConfig = new StageConfig(stage, loadout.startingEffects);
    const simulatorConfig = new SimulatorConfig({
      enableSkillCardOrder: loadout.enableSkillCardOrder
    });
    return new IdolStageConfig(idolConfig, stageConfig, enterPercents, simulatorConfig);
  }, [loadout, stage, enterPercents]);

  const linkConfigs = useMemo(() => {
    if (stage.type !== "linkContest") return null;
    return loadouts.map((ld) => {
      const idolConfig = new IdolConfig(ld);
      const stageConfig = new StageConfig(stage, ld.startingEffects);
      const simulatorConfig = new SimulatorConfig({
        enableSkillCardOrder: ld.enableSkillCardOrder
      });
      return new IdolStageConfig(idolConfig, stageConfig, enterPercents, simulatorConfig);
    });
  }, [loadouts, stage, enterPercents]);

  const { setModal } = useContext(ModalContext);

  const logs = engine?.logger.peekLogs(getState());
  const structuredLogs = useMemo(() => structureLogs(logs), [logs]);
  if (logs) {
    console.log("logs:", logs);
  }

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

  async function pickCardsToHold(state, cards, num = 1) {
    let selectedIndices = [];
    for (let i = 0; i < Math.min(num, cards.length); i++) {
      const promise = new Promise((resolve) => {
        setModal(
          <HoldCardPickerModal
            state={state}
            cards={cards}
            disabledIndices={selectedIndices}
            idolId={idolId}
            onPick={(index) => resolve(index)}
          />
        );
      }).then((index) => {
        selectedIndices.push(index);
      });
      await promise;
    }
    return selectedIndices;
  }

  function startStage() {
    setRunning(true);
    
    const engine = new StageEngine(config, linkConfigs);
    engine.strategy = new PlayerStrategy(engine, pickCardsToHold);
  
    engine.logger.reset();
    let state = engine.getInitialState();
    state = engine.startStage(state);

    setEngine(engine);
    setStateHistory([state]);
    
    pushLoadoutHistory();
    if (stage.type === "linkContest") {
      pushLoadoutsHistory();
    }
  }

  async function playCard(selectedIndex) {
    if (!running) return;
    const state = deepCopy(getState());
    const card = state[S.handCards][selectedIndex];
    if (!engine.isCardUsable(state, card)) {
      return;
    }
    const logIndex = engine.logger.log(state, "hand", null);
    let nextState;
    try {
      let previewState = deepCopy(state);
      nextState = engine.useCard(previewState, card);
    } catch (e) {
      if (e.message === "not picked") {
        const selectedIndices = await pickCardsToHold(e.args.state, e.args.cards, e.args.num);
        engine.strategy.pickCardsToHoldIndices = selectedIndices;
        let previewState = deepCopy(state);
        nextState = engine.useCard(previewState, card);
      } else {
        throw e;
      }
    }

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
    let nextState;
    try {
      let previewState = deepCopy(state);
      nextState = engine.useDrink(previewState, selectedIndex);
    } catch (e) {
      if (e.message === "not picked") {
        const selectedIndices = await pickCardsToHold(e.args.state, e.args.cards, e.args.num);
        engine.strategy.pickCardsToHoldIndices = selectedIndices;
        let previewState = deepCopy(state);
        nextState = engine.useDrink(previewState, selectedIndex);
      } else {
        throw e;
      }
    }

    pushState(nextState);
  }

  function endTurn() {
    if (!running) return;
    const nextState = engine.endTurn(getState());
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
    return state[S.handCards].map((card) => {
      if (!engine.isCardUsable(state, card)) {
        return -Infinity;
      }
      const tempPickCardsToHold = engine.strategy.pickCardsToHold;
      engine.strategy.pickCardsToHold = () => [];
      const previewState = deepCopy(state);
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

      // Apply card effects
      const effects = engine.cardManager.getLines(previewState, card, "effects");
      previewState[S.phase] = "processCard";
      // if (previewState[S.doubleCardEffectCards]) {
      //   previewState[S.doubleCardEffectCards]--;
      //   engine.effectManager.triggerEffects(previewState, effects, null, card);
      // }
      engine.effectManager.triggerEffects(previewState, effects, null, card);
      delete previewState[S.phase];
      engine.strategy.pickCardsToHold = tempPickCardsToHold;
      return previewState[S.score];
    });
  }

  return (
    <div id="simulator_loadout" className={styles.loadoutEditor}>
      <div className={styles.configurator}>
        <div>{t("multiplierNote")}</div>
        {stage.preview && <div>{t("previewNote")}</div>}
        <StageSelect />
        {stage.type !== "contest" ? (
          t("enterPercents")
        ) : (
          <div className={styles.percentRow}>
            <div className={styles.enterPercentsToggle}>
              <IconButton
                icon={FaArrowsRotate}
                size="small"
                onClick={() => setEnterPercents(!enterPercents)}
              />
              {enterPercents ? <FaPercent /> : <FaHashtag />}
            </div>
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
        {stage.type == "linkContest" && <div>{t("linkContestNote")}</div>}
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

        <SimulatorSubTools defaultCardIds={config.defaultCardIds} />

        <Button style="blue" onClick={startStage}>
          {!running ? t2("startStage") : t2("restartStage")}
        </Button>
        <SimulatorButtons />
        <div className={styles.skillCardOrderToggle}>
          <input
            type="checkbox"
            id="enableSkillCardOrder"
            checked={loadout.enableSkillCardOrder}
            onChange={(e) => setEnableSkillCardOrder(e.target.checked)}
          />
          <label htmlFor="enableSkillCardOrder">{t("enableSkillCardOrder")}</label>
        </div>
        {loadout.enableSkillCardOrder && (
          <>
            <SkillCardAndTurnTypeOrder
              config={config}
              idolId={config.idol.idolId || idolId}
              defaultCardIds={config.defaultCardIds}
            />
            <Button style="blue" onClick={startStage}>
              {!running ? t2("startStage") : t2("restartStage")}
            </Button>
          </>
        )}
        {getState() && (
          <div className={styles.playArea}>
            <TurnTypeViewer state={getState()} />
            <div className={styles.infoArea}>
              <StateViewer
                state={getState()}
                idolId={config.idol.idolId || idolId}
                plan={config.idol.plan || plan}
              />
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

      <Tooltip id="indications-tooltip" />
    </div>
  );
}
