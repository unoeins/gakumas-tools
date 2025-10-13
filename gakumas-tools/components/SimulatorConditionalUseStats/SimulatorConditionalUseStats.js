import { memo, useState, useContext } from "react";
import { useTranslations } from "next-intl";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import ModalContext from "@/contexts/ModalContext";
import UseStatsPickerModal from "./UseStatsPickerModal";
import styles from "./SimulatorConditionalUseStats.module.scss";

function SimulatorConditionalUseStats({ conditionalUseStats, idolId }) {
  const { setModal } = useContext(ModalContext);
  const [ selectedCard, setSelectedCard ] = useState(null);
  const [sortByRatio, setSortByRatio] = useState(true);
  const t = useTranslations("SimulatorConditionalUseStats");

  const key = selectedCard ? selectedCard.c ? JSON.stringify(selectedCard) : JSON.stringify({ id: selectedCard.id }) : null;
  const keyedData = key ? conditionalUseStats.data.get(key) : null;
  const useStats = keyedData ? Array.from({ length: keyedData.turns.length }, (_, i) => keyedData.turns[i] || new Map()) : [];
  console.log("conditionalUseStats", conditionalUseStats);
  console.log({selectedCard});
  console.log({key, keyedData, useStats});

  const sortedData = useStats.map((turnData) =>
    [...turnData].sort((a, b) => sortByRatio ?
      ((b[1].use / b[1].draw) - (a[1].use / a[1].draw)) :
        b[1].use - a[1].use)
      .map((entry) => (entry[1])));

  return (
    <div id="simulator_conditionalusestats" className={styles.useStats}>
      <div className={styles.useStatsHeader}>
        <label>{t("conditionalUseStats")}</label>
        <div>
          <input
            type="checkbox"
            id="sortByRatioConditional"
            checked={sortByRatio}
            onChange={(e) => setSortByRatio(e.target.checked)}
          />
          <label htmlFor="sortByRatioConditional">{t("sortByRatio")}</label>
        </div>
      </div>
      <div className={styles.skillCardSelect}>
        <EntityIcon
          key={`select`}
          type={EntityTypes.SKILL_CARD}
          id={selectedCard ? selectedCard.id : 0}
          customizations={selectedCard?.c}
          onClick={() =>
            setModal(
              <UseStatsPickerModal
                stats={conditionalUseStats}
                idolId={idolId}
                onPick={(id, c) =>
                  setSelectedCard(id != 0 ? { id, c } : null)
                }
              />
            )
          }
          idolId={idolId}
          size={`large`}
        />
      </div>
      {sortedData.map((turnData, turn) => (
        <div className={styles.useStatsTurnData} key={turn}>
          <div className={styles.useStatsTurn}>
            <span>{t("turn", { turn: turn + 1 })}</span>
          </div>
          <div className={styles.useStatsData}>
            {turnData.map((data) => (
              <div className={styles.useStatsCard} key={data.id}>
                <EntityIcon
                  key={`${turn}_${data.id}`}
                  type={EntityTypes.SKILL_CARD}
                  id={data.id}
                  customizations={data.c}
                  idolId={idolId}
                  label={"SKIP"}
                  size="fill"
                />
                <div>{data.use}</div>
                <div>{((data.use / data.draw * 100).toFixed(1))}%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(SimulatorConditionalUseStats);
