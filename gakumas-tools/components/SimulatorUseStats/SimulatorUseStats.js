import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import styles from "./SimulatorUseStats.module.scss";

function SimulatorUseStats({ useStats, idolId }) {
  const [sortByRatio, setSortByRatio] = useState(true);
  const t = useTranslations("SimulatorUseStats");
  const sortedData = useStats.data.map((turnData) => 
    [...turnData].sort((a, b) => sortByRatio ?
      ((b[1].use / (b[1].id !== 0 ? b[1].draw : useStats.numRuns)) -
       (a[1].use / (a[1].id !== 0 ? a[1].draw : useStats.numRuns))) :
        b[1].use - a[1].use)
      .map((entry) => (entry[1])));

  return (
    <div id="simulator_usestats" className={styles.useStats}>
      <div className={styles.useStatsHeader}>
        <label>{t("useStats")}</label>
        <div>
          <input
            type="checkbox"
            id="sortByRatio"
            checked={sortByRatio}
            onChange={(e) => setSortByRatio(e.target.checked)}
          />
          <label htmlFor="sortByRatio">{t("sortByRatio")}</label>
        </div>
      </div>
      {sortedData.map((turnData, turn) => (
        <div className={styles.useStatsTurnData} key={turn}>
          <div className={styles.useStatsTurn}>
            <span>{t("turn", { turn: turn + 1 })}</span>
          </div>
          <div className={styles.useStatsData}>
            {turnData.map((data, i) => (
              <div className={styles.useStatsCard} key={`${i}_${data.id}_${data.c}`}>
                <EntityIcon
                  type={EntityTypes.SKILL_CARD}
                  id={data.id}
                  customizations={data.c}
                  idolId={idolId}
                  label={"SKIP"}
                  size="fill"
                />
                <div>{data.use}</div>
                <div>{((data.use / (data.id !== 0 ? data.draw : useStats.numRuns) * 100).toFixed(1))}%</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(SimulatorUseStats);
