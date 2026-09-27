import { memo, useState, useContext } from "react";
import { useTranslations } from "next-intl";
import { FaChevronDown } from "react-icons/fa6";
import Collapse from "@/components/Collapse";
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
          aria-expanded={activeSubTool === "costRanges"}
        >
          {t("costRanges")}
          <FaChevronDown aria-hidden="true" />
        </button>

        {!isExam && (
          <button
            disabled={!config.defaultCardIds.length}
            className={c(activeSubTool === "defaultCards" && styles.expanded)}
            onClick={() => toggleSubTool("defaultCards")}
            aria-expanded={activeSubTool === "defaultCards"}
          >
            {t("defaultCards")}
            <FaChevronDown aria-hidden="true" />
          </button>
        )}
        {isExam && (
          <button
            disabled={!config.initialCardIds.length}
            className={c(activeSubTool === "initialCards" && styles.expanded)}
            onClick={() => toggleSubTool("initialCards")}
            aria-expanded={activeSubTool === "initialCards"}
          >
            {t("initialCards")}
            <FaChevronDown aria-hidden="true" />
          </button>
        )}

        <button
          className={c(activeSubTool === "extensions" && styles.expanded)}
          onClick={() => toggleSubTool("extensions")}
          aria-expanded={activeSubTool === "extensions"}
        >
          {t("extensions")}
          <FaChevronDown aria-hidden="true" />
        </button>
      </div>

      <Collapse
        open={activeSubTool == "costRanges"}
        className={styles.subTool}
      >
        <CostRanges />
      </Collapse>
      <Collapse
        open={activeSubTool == "defaultCards" && !!config.defaultCardIds.length}
        className={styles.subTool}
      >
        <DefaultCards skillCardIds={config.defaultCardIds} />
      </Collapse>
      <Collapse
        open={activeSubTool == "initialCards" && !!config.initialCardIds.length}
        className={styles.subTool}
      >
        <DefaultCards
          skillCardIds={config.initialCardIds}
          onClickAddCards={() => {
            const initialIndex = loadout.skillCardIdGroups[0].length - 1;
            config.initialCardIds.forEach((id, i) => {
              replaceSkillCardId(initialIndex + i, id);
            });
          }}
        />
      </Collapse>
      <Collapse
        open={activeSubTool == "extensions"}
        className={styles.subTool}
      >
        <SimulatorExtensions
          mode={mode}
          config={config}
          idolId={idolId}
          listenerConfig={listenerConfig}
          setListenerConfig={setListenerConfig}
        />
      </Collapse>
    </>
  );
}

export default memo(SimulatorSubTools);
