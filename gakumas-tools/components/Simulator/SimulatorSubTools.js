import { memo, useState, useContext } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import CostRanges from "@/components/CostRanges";
import DefaultCards from "@/components/DefaultCards";
import SimulatorExtensions from "@/components/SimulatorExtensions";
import LoadoutContext from "@/contexts/LoadoutContext";
import c from "@/utils/classNames";
import styles from "./Simulator.module.scss";

function SimulatorSubTools({ config, idolId, mode, listenerConfig, setListenerConfig }) {
  const t = useTranslations("SimulatorSubTools");
  const {
    loadout,
    replaceSkillCardId,
  } = useContext(LoadoutContext);
  const [activeSubTool, setActiveSubTool] = useState(null);

  const toggleSubTool = (subTool) => {
    setActiveSubTool(activeSubTool == subTool ? null : subTool);
  };

  const isExam = config.stage.type === "exam";

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

        {!isExam && (
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
        )}
        {isExam && (
          <button
            disabled={!config.initialCardIds}
            className={c(
              !config.initialCardIds && styles.disabled,
              activeSubTool === "initialCards" && styles.expanded
            )}
            onClick={() => toggleSubTool("initialCards")}
          >
            {t("initialCards")}
            <FaChevronDown />
          </button>
        )}

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
      {activeSubTool == "initialCards" && config.initialCardIds && (
        <DefaultCards
          skillCardIds={config.initialCardIds}
          onClickAddCards={() => {
            const initialIndex = loadout.skillCardIdGroups[0].length - 1;
            config.initialCardIds.forEach((id, i) => {
              replaceSkillCardId(initialIndex + i, id);
            });
          }}
        />
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
