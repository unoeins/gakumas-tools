import { memo, useContext } from "react";
import { useTranslations } from "next-intl";
import LoadoutContext from "@/contexts/LoadoutContext";
import ModalContext from "@/contexts/ModalContext";
import TurnTypePickerModal from "./TurnTypePickerModal";
import TurnTypeIcon from "./TurnTypeIcon";
import styles from "./TurnTypeOrder.module.scss";

function TurnTypeOrder({
  turnTypeOrder,
}) {
  const t = useTranslations("TurnTypeOrder");
  const {
    replaceTurnTypeOrder,
    swapTurnTypeOrder,
  } = useContext(LoadoutContext);
  const { setModal } = useContext(ModalContext);
  return (
    <div id="turnTypeOrder" className={styles.turnTypeOrder}>
        {turnTypeOrder.map((turnType, i) => (
          <TurnTypeIcon
            key={i}
            turnType={turnType}
            label={i + 1}
            index={i}
            onClick={() =>
              setModal(
                <TurnTypePickerModal
                  onPick={(turnType) => {
                    replaceTurnTypeOrder(i, turnType);
                  }}
                />
              )
            }
            onSwap={swapTurnTypeOrder}
            size="fill"
          />
        ))}
    </div>
  );
}

export default memo(TurnTypeOrder);
