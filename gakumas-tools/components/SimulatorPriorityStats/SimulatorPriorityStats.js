import { useContext, useState, memo } from "react";
import { useTranslations } from "next-intl";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import ModalContext from "@/contexts/ModalContext";
import PriorityPickerModal from "./PriorityPickerModal";
import styles from "./SimulatorPriorityStats.module.scss";

function SimulatorPriorityStats({ priorityStats, idolId }) {
  const { setModal } = useContext(ModalContext);
  const [ selectedCardA, setSelectedCardA ] = useState(null);
  const [ selectedCardB, setSelectedCardB ] = useState(null);
  const t = useTranslations("SimulatorPriorityStats");

  const keyA = selectedCardA ? selectedCardA.c ? JSON.stringify(selectedCardA) : JSON.stringify({ id: selectedCardA.id }) : null;
  const keyB = selectedCardB ? selectedCardB.c ? JSON.stringify(selectedCardB) : JSON.stringify({ id: selectedCardB.id }) : null;

  const otherDataA = priorityStats.data.has(keyA) ? priorityStats.data.get(keyA).others.get(keyB) : null;
  const otherDataB = priorityStats.data.has(keyB) ? priorityStats.data.get(keyB).others.get(keyA) : null;

  const countA = otherDataA ? otherDataA.count : [];
  const countB = otherDataB ? otherDataB.count : [];

  const length = Math.max(countA.length, countB.length);
  const turnDataA = Array.from({ length: length }, (_, i) => countA[i] || 0);
  const turnDataB = Array.from({ length: length }, (_, i) => countB[i] || 0);

  // console.log("priorityStats", priorityStats);
  // console.log({selectedCardA, selectedCardB});
  // console.log({keyA, keyB, otherDataA, otherDataB, turnDataA, turnDataB});
  return (
    <div id="simulator_prioritystats" className={styles.priorityStats}>
      <label>{t("priorityStats")}</label>
      <div className={styles.skillCardSelect}>
        <EntityIcon
          type={EntityTypes.SKILL_CARD}
          id={selectedCardA ? selectedCardA.id : 0}
          customizations={selectedCardA?.c}
          onClick={() =>
            setModal(
              <PriorityPickerModal
                stats={priorityStats}
                idolId={idolId}
                onPick={(id, c) =>
                  setSelectedCardA(id != 0 ? { id, c } : null)
                }
              />
            )
          }
          idolId={idolId}
          size={`large`}
        />
        <EntityIcon
          type={EntityTypes.SKILL_CARD}
          id={selectedCardB ? selectedCardB.id : 0}
          customizations={selectedCardB?.c}
          onClick={() =>
            setModal(
              <PriorityPickerModal
                stats={priorityStats}
                idolId={idolId}
                onPick={(id, c) =>
                  setSelectedCardB(id != 0 ? { id, c } : null)
                }
              />
            )
          }
          idolId={idolId}
          size={`large`}
        />
      </div>
      {selectedCardA && selectedCardB && (
        <div className={styles.priorityStatsTurns}>
        {Array.from({ length: length }).map((_, turn) => (
          <div className={styles.priorityStatsTurnData} key={turn}>
            <div className={styles.priorityStatsTurn}>
              <span>{t("turn", { turn: turn + 1 })}</span>
            </div>
            <div className={styles.priorityStatsData}>
              <div className={styles.priorityStatsCard}>
                <EntityIcon
                  type={EntityTypes.SKILL_CARD}
                  id={selectedCardA.id}
                  customizations={selectedCardA.c}
                  idolId={idolId}
                  size="fill"
                />
                <div>{turnDataA[turn] || 0}</div>
                <div>{((turnDataA[turn] + turnDataB[turn] > 0) ? (turnDataA[turn] / (turnDataA[turn] + turnDataB[turn]) * 100).toFixed(1) : 0)}%</div>
              </div>
              <div className={styles.priorityStatsCard}>
                <EntityIcon
                  type={EntityTypes.SKILL_CARD}
                  id={selectedCardB.id}
                  customizations={selectedCardB.c}
                  idolId={idolId}
                  size="fill"
                />
                <div>{turnDataB[turn] || 0}</div>
                <div>{((turnDataA[turn] + turnDataB[turn] > 0) ? (turnDataB[turn] / (turnDataA[turn] + turnDataB[turn]) * 100).toFixed(1) : 0)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
    </div>
  );
}

export default memo(SimulatorPriorityStats);
