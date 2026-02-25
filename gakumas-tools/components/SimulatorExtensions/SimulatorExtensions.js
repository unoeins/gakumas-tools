import { memo, useContext } from "react";
import { useTranslations } from "next-intl";
import SkillCardAndTurnTypeOrder from "@/components/SkillCardOrderGroups/SkillCardAndTurnTypeOrder";
import LoadoutContext from "@/contexts/LoadoutContext";
import styles from "./SimulatorExtensions.module.scss";

function SimulatorExtensions({ mode, config, idolId, listenerConfig, setListenerConfig }) {
  const t = useTranslations("SimulatorExtensions");
  const {
    loadout,
    setEnableSkillCardOrder,
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
      {mode == "simulator" && (
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
        </>
      )}
    </div>
  );
}

export default memo(SimulatorExtensions);
