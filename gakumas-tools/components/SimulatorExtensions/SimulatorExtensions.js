import { memo, useContext } from "react";
import { useTranslations } from "next-intl";
import Input from "@/components/Input";
import SkillCardAndTurnTypeOrder from "@/components/SkillCardOrderGroups/SkillCardAndTurnTypeOrder";
import LoadoutContext from "@/contexts/LoadoutContext";
import styles from "./SimulatorExtensions.module.scss";

function SimulatorExtensions({ mode, config, idolId, listenerConfig, setListenerConfig }) {
  const t = useTranslations("SimulatorExtensions");
  const {
    loadout,
    setEnableSkillCardOrder,
    setEnableStrategyCustomization,
    setMaxDepth,
    setNextDepth,
    setScoreMultiplier,
    setGoodConditionTurnsMultiplier,
    setConcentrationMultiplier,
    setGoodImpressionTurnsMultiplier,
    setMotivationMultiplier,
    setFullPowerMultiplier,
    setEnableEffectScore,
    setEffectScoreMultiplier,
    setEnableNewHoldStrategy,
  } = useContext(LoadoutContext);
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
              checked={loadout.enableStrategyCustomization}
              onChange={(e) => setEnableStrategyCustomization(e.target.checked)}
            />
            <label htmlFor="enableStrategyCustomization">{t("enableStrategyCustomization")}</label>
          </div>
          {loadout.enableStrategyCustomization && (
            <div className={styles.strategyCustomizationInputs}>
              <div className={styles.customizationGroup}>
                <div>
                  <label htmlFor="maxDepth">{t("maxDepth")}</label>
                  <Input
                    type="number"
                    id="maxDepth"
                    round={true}
                    min={1}
                    max={10}
                    value={loadout.maxDepth}
                    onChange={(value) => setMaxDepth(parseInt(value))}
                  />
                </div>
                <div>
                  <label htmlFor="nextDepth">{t("nextDepth")}</label>
                  <Input
                    type="number"
                    id="nextDepth"
                    round={true}
                    min={1}
                    max={10}
                    value={loadout.nextDepth}
                    onChange={(value) => setNextDepth(parseInt(value))}
                  />
                </div>
              </div>
              <div className={styles.customizationGroup}>
                <div>
                  <label htmlFor="scoreMultiplier">{t("scoreMultiplier")}</label>
                  <Input
                    type="number"
                    id="scoreMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.scoreMultiplier}
                    onChange={(value) => setScoreMultiplier(parseInt(value))}
                  />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="enableEffectScore"
                    checked={loadout.enableEffectScore}
                    onChange={(e) => setEnableEffectScore(e.target.checked)}
                  />
                  <label htmlFor="enableEffectScore">{t("enableEffectScore")}</label>
                </div>
                <div>
                  <label htmlFor="effectScoreMultiplier">{t("effectScoreMultiplier")}</label>
                  <Input
                    type="number"
                    id="effectScoreMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.effectScoreMultiplier}
                    onChange={(value) => setEffectScoreMultiplier(parseInt(value))}
                  />
                </div>
              </div>
              <div className={styles.customizationGroup}>
                <div>
                  <label htmlFor="goodConditionTurnsMultiplier">{t("goodConditionTurnsMultiplier")}</label>
                  <Input
                    type="number"
                    id="goodConditionTurnsMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.goodConditionTurnsMultiplier}
                    onChange={(value) => setGoodConditionTurnsMultiplier(parseInt(value))}
                  />
                </div>
                <div>
                  <label htmlFor="concentrationMultiplier">{t("concentrationMultiplier")}</label>
                  <Input
                    type="number"
                    id="concentrationMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.concentrationMultiplier}
                    onChange={(value) => setConcentrationMultiplier(parseInt(value))}
                  />
                </div>
              </div>
              <div className={styles.customizationGroup}>
                <div>
                  <label htmlFor="goodImpressionTurnsMultiplier">{t("goodImpressionTurnsMultiplier")}</label>
                  <Input
                    type="number"
                    id="goodImpressionTurnsMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.goodImpressionTurnsMultiplier}
                    onChange={(value) => setGoodImpressionTurnsMultiplier(parseInt(value))}
                  />
                </div>
                <div>
                  <label htmlFor="motivationMultiplier">{t("motivationMultiplier")}</label>
                  <Input
                    type="number"
                    id="motivationMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.motivationMultiplier}
                    onChange={(value) => setMotivationMultiplier(parseInt(value))}
                  />
                </div>
              </div>
              <div className={styles.customizationGroup}>
                <div>
                  <label htmlFor="fullPowerMultiplier">{t("fullPowerMultiplier")}</label>
                  <Input
                    type="number"
                    id="fullPowerMultiplier"
                    round={true}
                    min={1}
                    max={10000}
                    value={loadout.fullPowerMultiplier}
                    onChange={(value) => setFullPowerMultiplier(parseInt(value))}
                  />
                </div>
                <div>
                  <input
                    type="checkbox"
                    id="enableNewHoldStrategy"
                    checked={loadout.enableNewHoldStrategy}
                    onChange={(e) => setEnableNewHoldStrategy(e.target.checked)}
                  />
                  <label htmlFor="enableNewHoldStrategy">{t("enableNewHoldStrategy")}</label>
                </div>
              </div>
            </div>
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
