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

  let turnTypes = ["vocal", "dance", "visual"]
  if(includeNull) {
    turnTypes.unshift("none");
  }

  return (
    <Modal>
      <div className={styles.turnTypes}>
      {turnTypes.map((turnType, index) => (
          <TurnTypeIcon
            key={`${turnType}_${index}`}
            turnType={turnType}
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
