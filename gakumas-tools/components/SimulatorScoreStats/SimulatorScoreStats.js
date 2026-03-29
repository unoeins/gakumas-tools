import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import c from "@/utils/classNames";
import EntityScore from "./EntityScore";
import styles from "./SimulatorScoreStats.module.scss";

function SimulatorScoreStats({ scoreStats, idolId }) {
  const [turnTypeScore, setTurnTypeScore] = useState(false);
  const t = useTranslations("SimulatorScoreStats");

  function getScore(scores) {
    return scores.vocal + scores.dance + scores.visual;
  }

  const sortedData = scoreStats.data.map((turnData) => 
    [...turnData].sort((a, b) => getScore(b[1].scores) - getScore(a[1].scores))
    .map((entry) => (entry[1])));
  const totalDataMap = scoreStats.data.reduce((acc, cur) => {
    cur.forEach((value, key) => {
      let data = acc.get(key);
      if (data) {
        data.scores.vocal += value.scores.vocal;
        data.scores.dance += value.scores.dance;
        data.scores.visual += value.scores.visual;
      } else {
        data = { ...value, scores: { ...value.scores } };
        acc.set(key, data);
      }
    });
    return acc;
  }, new Map());
  const totalData = [...totalDataMap.values()].sort(
    (a, b) => getScore(b.scores) - getScore(a.scores)
  );
  const totalTurnTypes = scoreStats.turnTypes.reduce((acc, cur) => {
    acc.vocal += cur.vocal;
    acc.dance += cur.dance;
    acc.visual += cur.visual;
    return acc;
  }, { vocal: 0, dance: 0, visual: 0 });

  return (
    <div id="simulator_scorestats" className={styles.scoreStats}>
      <div className={styles.scoreStatsHeader}>
        <label>{t("scoreStats")}</label>
        <div>
          <input
            type="checkbox"
            id="turnTypeScore"
            checked={turnTypeScore}
            onChange={(e) => setTurnTypeScore(e.target.checked)}
          />
          <label htmlFor="turnTypeScore">{t("turnTypeScore")}</label>
        </div>
      </div>
      <div className={styles.scoreStatsTurnData}>
        <div className={styles.scoreStatsTurn}>
          <span>{t("total")}</span>
          <div className={styles.turnTypes}>
            <div className={c(styles.turnType, styles.vocal)}>{totalTurnTypes.vocal}</div>
            <div className={c(styles.turnType, styles.dance)}>{totalTurnTypes.dance}</div>
            <div className={c(styles.turnType, styles.visual)}>{totalTurnTypes.visual}</div>
          </div>
        </div>
        <div className={styles.scoreStatsData}>
          {totalData.map((data, i) => (
            <EntityScore
              key={`${i}_${data.type}_${data.id}`}
              entity={data}
              turnTypes={totalTurnTypes}
              numRuns={scoreStats.numRuns}
              idolId={idolId}
              turnTypeScore={turnTypeScore}
            />
          ))}
        </div>
      </div>
      {sortedData.map((turnData, turn) => (
        <div className={styles.scoreStatsTurnData} key={turn}>
          <div className={styles.scoreStatsTurn}>
            <span>{t("turn", { turn: turn + 1 })}</span>
            <div className={styles.turnTypes}>
              <div className={c(styles.turnType, styles.vocal)}>{scoreStats.turnTypes[turn].vocal}</div>
              <div className={c(styles.turnType, styles.dance)}>{scoreStats.turnTypes[turn].dance}</div>
              <div className={c(styles.turnType, styles.visual)}>{scoreStats.turnTypes[turn].visual}</div>
            </div>
          </div>
          <div className={styles.scoreStatsData}>
            {turnData.map((data, i) => (
              <EntityScore
                key={`${i}_${data.type}_${data.id}`}
                entity={data}
                turnTypes={scoreStats.turnTypes[turn]}
                numRuns={scoreStats.numRuns}
                idolId={idolId}
                turnTypeScore={turnTypeScore}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(SimulatorScoreStats);
