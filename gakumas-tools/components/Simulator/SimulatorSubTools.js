import { memo, useContext, useState } from "react";
import { useTranslations } from "next-intl";
import CostRanges from "@/components/CostRanges";
import LoadoutHistory from "@/components/LoadoutHistory";
import DefaultCards from "@/components/DefaultCards";
import SimulatorExtensions from "@/components/SimulatorExtensions";
import LoadoutHistoryContext from "@/contexts/LoadoutHistoryContext";
import c from "@/utils/classNames";
import styles from "./Simulator.module.scss";

function SimulatorSubTools({ config, idolId, mode, listenerConfig, setListenerConfig }) {
  const t = useTranslations("SimulatorSubTools");

  const { loadoutHistory } = useContext(LoadoutHistoryContext);
  const [activeSubTool, setActiveSubTool] = useState(null);

  const toggleSubTool = (subTool) => {
    setActiveSubTool(activeSubTool == subTool ? null : subTool);
  };

  return (
    <>
      <div className={styles.expanderButtons}>
        <button onClick={() => toggleSubTool("costRanges")}>
          {t("costRanges")}
        </button>

        <button
          disabled={!loadoutHistory.length}
          className={c(!loadoutHistory.length && styles.disabled)}
          onClick={() => toggleSubTool("history")}
        >
          {t("history")}
        </button>

        <button
          disabled={!config.defaultCardIds.length}
          className={c(!config.defaultCardIds.length && styles.disabled)}
          onClick={() => toggleSubTool("defaultCards")}
        >
          {t("defaultCards")}
        </button>

        <button onClick={() => toggleSubTool("extensions")}>
          {t("extensions")}
        </button>
      </div>

      {activeSubTool == "costRanges" && <CostRanges />}
      {activeSubTool == "history" && <LoadoutHistory />}
      {activeSubTool == "defaultCards" && config.defaultCardIds && (
        <DefaultCards skillCardIds={config.defaultCardIds} />
      )}
      {activeSubTool == "extensions" && (
        <SimulatorExtensions
          mode={mode}
          config={config}
          idolId={idolId}
          listenerConfig={listenerConfig}
          setListenerConfig={setListenerConfig}
        />
      )}
    </>
  );
}

export default memo(SimulatorSubTools);
