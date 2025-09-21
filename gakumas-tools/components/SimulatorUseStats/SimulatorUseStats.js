import { memo } from "react";
import { useTranslations } from "next-intl";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import styles from "./SimulatorUseStats.module.scss";

function SimulatorUseStats({ useStats, idolId }) {
  // const t = useTranslations("SimulatorUseStats");
  const sortedData = useStats.data.map((turnData) => turnData.sort((a, b) => b.count - a.count));

  return (
    <div id="simulator_usestats" className={styles.useStats}>
      <h2>Use Stats</h2>
      {sortedData.map((turnData, turn) => (
        <div className={styles.useStatsTurnData} key={turn}>
          <div className={styles.useStatsTurn}>
            <span>Turn {turn + 1}</span>
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
                  label={"skip"}
                  size="fill"
                />
                <span>{data.count}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(SimulatorUseStats);
