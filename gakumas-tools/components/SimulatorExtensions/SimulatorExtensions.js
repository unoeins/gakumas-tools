import { memo, useMemo, useContext, useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  FaCheck,
  FaRegCopy,
  FaRegPaste,
  FaRegTrashCan,
} from "react-icons/fa6";
import { StrategyCustomizations } from "gakumas-data";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
import Input from "@/components/Input";
import SkillCardAndTurnTypeOrder from "@/components/SkillCardOrderGroups/SkillCardAndTurnTypeOrder";
import LoadoutContext from "@/contexts/LoadoutContext";
import ModalContext from "@/contexts/ModalContext";
import { loadoutFromSearchParams, loadoutsFromSearchParams } from "@/utils/simulator";
import styles from "./SimulatorExtensions.module.scss";

function SimulatorExtensions({ mode, config, idolId, listenerConfig, setListenerConfig }) {
  const t = useTranslations("SimulatorExtensions");
  const {
    loadout,
    simulatorUrl,
    setEnableSkillCardOrder,
    setEnableStrategyCustomizations,
    setStrategyCustomizations,
  } = useContext(LoadoutContext);
  const { setModal } = useContext(ModalContext);

  const [linkCopied, setLinkCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    },
    [],
  );

  const strategyCustomizations = useMemo(
    () => new StrategyCustomizations(loadout.strategyCustomizations, setStrategyCustomizations),
    [loadout.strategyCustomizations]
  );

  async function readStrategyCustomizationsFromUrl() {
    try {
      const text = await navigator.clipboard.readText();
      if (!/^https?:\/\/.+/i.test(text)) {
        setModal(<ConfirmModal message={t("invalidUrl")} showCancel={false} />);
        return;
      }
      const url = new URL(text);
      const loadouts = loadoutsFromSearchParams(url.searchParams);
      const loadout = loadouts[0] || loadoutFromSearchParams(url.searchParams);
      if (loadout.enableStrategyCustomizations && loadout.strategyCustomizations) {
        setModal(<ConfirmModal message={t("confirmSetLoadout")} onConfirm={() => {
          setStrategyCustomizations(loadout.strategyCustomizations);
        }} />);
      } else {
        setModal(<ConfirmModal message={t("invalidLoadout")} showCancel={false} />);
      }
    } catch (err) {
      console.error("Clipboard error:", err);
      setModal(<ConfirmModal message={t("clipboardError")} showCancel={false} />);
    }
  }

  return (
    <div className={styles.simulatorExtensions}>
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
        <SkillCardAndTurnTypeOrder
          config={config}
          idolId={config.idol.idolId || idolId}
          defaultCardIds={config.defaultCardIds}
        />
      )}
      {mode === "simulator" && (
        <>
          <div className={styles.useStatsToggle}>
            <input
              type="checkbox"
              id="enableUseStats"
              checked={listenerConfig.enableUseStats}
              onChange={(e) => setListenerConfig({
                ...listenerConfig,
                enableUseStats: e.target.checked
              })}
            />
            <label htmlFor="enableUseStats">{t("enableUseStats")}</label>
          </div>
          <div className={styles.conditionalUseStatsToggle}>
            <input
              type="checkbox"
              id="enableConditionalUseStats"
              checked={listenerConfig.enableConditionalUseStats}
              onChange={(e) => setListenerConfig({
                ...listenerConfig,
                enableConditionalUseStats: e.target.checked
              })}
            />
            <label htmlFor="enableConditionalUseStats">{t("enableConditionalUseStats")}</label>
          </div>
          {/* <div className={styles.priorityStatsToggle}>
            <input
              type="checkbox"
              id="enablePriorityStats"
              checked={listenerConfig.enablePriorityStats}
              onChange={(e) => setListenerConfig({ ...listenerConfig, enablePriorityStats: e.target.checked })}
            />
            <label htmlFor="enablePriorityStats">{t("enablePriorityStats")}</label>
          </div> */}
          <div className={styles.scoreStatsToggle}>
            <input
              type="checkbox"
              id="enableScoreStats"
              checked={listenerConfig.enableScoreStats}
              onChange={(e) => setListenerConfig({
                ...listenerConfig,
                enableScoreStats: e.target.checked
              })}
            />
            <label htmlFor="enableScoreStats">{t("enableScoreStats")}</label>
          </div>
          <div className={styles.strategyCustomizationToggle}>
            <input
              type="checkbox"
              id="enableStrategyCustomization"
              checked={loadout.enableStrategyCustomizations}
              onChange={(e) => setEnableStrategyCustomizations(e.target.checked)}
            />
            <label htmlFor="enableStrategyCustomization">{t("enableStrategyCustomization")}</label>
          </div>
          {loadout.enableStrategyCustomizations && (
            <>
            <div className={styles.strategyCustomizations}>
              {StrategyCustomizations.getAll().map((customization) => (
                <div key={customization.id} className={styles.strategyCustomizationInput}>
                  {customization.type === "boolean" && (
                    <input
                      type="checkbox"
                      id={customization.name}
                      checked={strategyCustomizations.get(customization.id)}
                      onChange={(e) => strategyCustomizations.set(customization.id, e.target.checked)}
                    />
                  )}
                  <label htmlFor={customization.name}>{t(customization.name)}</label>
                  {customization.type === "integer" && (
                    <Input
                      type="number"
                      id={customization.name}
                      round={true}
                      min={customization.min}
                      max={customization.max}
                      value={strategyCustomizations.get(customization.id)}
                      onChange={(value) => strategyCustomizations.set(customization.id, parseInt(value))}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className={styles.buttons}>
              <Button
                style="red-secondary"
                size="sm"
                onClick={() =>
                  setModal(
                    <ConfirmModal message={t("confirm")} onConfirm={() => 
                       strategyCustomizations.resetAll()
                    }/>
                  )
                }
              >
                <FaRegTrashCan />
                <span className={styles.buttonText}>{t("reset")}</span>
              </Button>
              {!!simulatorUrl && (
                <>
                  <Button
                    style="blue-secondary"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(simulatorUrl);
                      setLinkCopied(true);
                      if (copiedTimerRef.current) {
                        clearTimeout(copiedTimerRef.current);
                      }
                      copiedTimerRef.current = setTimeout(
                        () => setLinkCopied(false),
                        3000,
                      );
                    }}
                  >
                    {linkCopied ? <FaCheck /> : <FaRegCopy />}
                    <span className={styles.buttonText}>URL</span>
                  </Button>
                </>
              )}
              <Button
                style="blue-secondary"
                size="sm"
                onClick={() => readStrategyCustomizationsFromUrl()}
              >
                <FaRegPaste />
                <span className={styles.buttonText}>{t("readFromUrl")}</span>
              </Button>
            </div>
            </>
          )}
        </>
      )}
      {mode === "contestPlayer" && (
        <div className={styles.selectRandomCardsToggle}>
          <input
            type="checkbox"
            id="enableSelectRandomCards"
            checked={listenerConfig.enableSelectRandomCards}
            onChange={(e) => setListenerConfig({
              ...listenerConfig,
              enableSelectRandomCards: e.target.checked
            })}
          />
          <label htmlFor="enableSelectRandomCards">{t("enableSelectRandomCards")}</label>
        </div>
      )}
    </div>
  );
}

export default memo(SimulatorExtensions);
