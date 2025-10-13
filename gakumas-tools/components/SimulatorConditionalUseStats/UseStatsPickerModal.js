import { memo, useContext } from "react";
import EntityIcon from "@/components/EntityIcon";
import Modal from "@/components/Modal";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./SimulatorConditionalUseStats.module.scss";

function UseStatsPickerModal({
  stats,
  idolId,
  onPick,
  includeNull = true,
}) {
  const { closeModal } = useContext(ModalContext);

  let sortedData = [...stats.data.values()].sort((a, b) => {
    if (a.id !== b.id) {
      return b.id - a.id;
    } else if (a.c == null && b.c == null) {
      return 0;
    } else if (a.c == null) {
      return -1;
    } else if (b.c == null) {
      return 1;
    } else {
      return JSON.stringify(b.c).localeCompare(JSON.stringify(a.c));
    }
  });
  if (includeNull) {
    sortedData.push({ id: 0 });
  }

  return (
    <Modal>
      <div className={styles.entities}>
      {sortedData.map((data, index) => (
        <EntityIcon
          key={`${data.id}_${index}`}
          type={EntityTypes.SKILL_CARD}
          id={data.id}
          customizations={data.c}
          idolId={idolId}
          onClick={(cardId, customizations) => {
            onPick(cardId, customizations);
            closeModal();
          }}
          size="fill"
          argumentType="card_customization"
        />
      ))}
      </div>
    </Modal>
  );
}

export default memo(UseStatsPickerModal);
