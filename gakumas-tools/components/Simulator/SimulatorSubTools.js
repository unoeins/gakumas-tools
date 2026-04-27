import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import CostRanges from "@/components/CostRanges";
import DefaultCards from "@/components/DefaultCards";
import SimulatorExtensions from "@/components/SimulatorExtensions";
import c from "@/utils/classNames";
import styles from "./Simulator.module.scss";

function SimulatorSubTools({ config, idolId, mode, listenerConfig, setListenerConfig }) {
  const t = useTranslations("SimulatorSubTools");
  const [activeSubTool, setActiveSubTool] = useState(null);

  const toggleSubTool = (subTool) => {
    setActiveSubTool(activeSubTool == subTool ? null : subTool);
  };

  return (
    <>
      <div className={styles.expanderButtons}>
        <button
          className={c(activeSubTool === "costRanges" && styles.expanded)}
          onClick={() => toggleSubTool("costRanges")}
        >
          {t("costRanges")}
          <FaChevronDown />
        </button>

        <button
          disabled={!config.defaultCardIds.length}
          className={c(
            !config.defaultCardIds.length && styles.disabled,
            activeSubTool === "defaultCards" && styles.expanded
          )}
          onClick={() => toggleSubTool("defaultCards")}
        >
          {t("defaultCards")}
          <FaChevronDown />
        </button>

        <button
          className={c(activeSubTool === "extensions" && styles.expanded)}
          onClick={() => toggleSubTool("extensions")}
        >
          {t("extensions")}
          <FaChevronDown />
        </button>
      </div>

      {activeSubTool == "costRanges" && <CostRanges />}
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
