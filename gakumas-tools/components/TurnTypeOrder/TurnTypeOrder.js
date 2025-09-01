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
  } = useContext(LoadoutContext);
  const { setModal } = useContext(ModalContext);
  return (
    <>
        <div id="turnTypeOrder" className={styles.turnTypeOrder}>
            {turnTypeOrder.map((turnType, i) => (
              <TurnTypeIcon
                key={i}
                turnType={turnType}
                label={i + 1}
                onClick={() =>
                  setModal(
                    <TurnTypePickerModal
                      onPick={(turnType) => {
                        replaceTurnTypeOrder(i, turnType);
                      }}
                    />
                  )
                }
                size="fill"
              />
            ))}
        </div>
        <div className={styles.sub}>
          <div className={styles.title}>
            {t("turn_type_order")}
          </div>
        </div>
      </>
  );
}

export default memo(TurnTypeOrder);
