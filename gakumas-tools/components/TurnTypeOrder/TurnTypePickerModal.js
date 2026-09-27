import { memo, useContext } from "react";
import TurnTypeIcon from "./TurnTypeIcon";
import Modal from "@/components/Modal";
import ModalContext from "@/contexts/ModalContext";
import styles from "./TurnTypeOrder.module.scss";

function TurnTypePickerModal({
  onPick,
  includeNull = true,
}) {
  const { closeModal } = useContext(ModalContext);

  let turnTypes = ["vocal", "dance", "visual"];
  let labels = ["Vo", "Da", "Vi"];
  if(includeNull) {
    turnTypes.unshift("none");
    labels.unshift("");
  }

  return (
    <Modal>
      <div className={styles.turnTypes}>
        {turnTypes.map((turnType, index) => (
          <TurnTypeIcon
            key={`${turnType}_${index}`}
            turnType={turnType}
            label={labels[index]}
            onClick={(turnType) => {
              onPick(turnType);
              closeModal();
            }}
            size="fill"
          />
        ))}
      </div>
    </Modal>
  );
}

export default memo(TurnTypePickerModal);
