import { memo, useContext } from "react";
import EntityIcon from "@/components/EntityIcon";
import EntityPickerModal from "@/components/EntityPickerModal";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./StagePDrinks.module.scss";

function StagePDrinks({ pDrinkIds, replacePDrinkId, swapPDrinkIds, indications, size }) {
  const { setModal } = useContext(ModalContext);

  return (
    <div className={styles.stagePDrinks}>
      {pDrinkIds.map((pDrinkId, index) => (
        <EntityIcon
          key={`${index}_${pDrinkId}`}
          type={EntityTypes.P_DRINK}
          id={pDrinkId}
          index={index}
          indications={indications?.[index]}
          onClick={() =>
            setModal(
              <EntityPickerModal
                type={EntityTypes.P_DRINK}
                onPick={(card) => replacePDrinkId(index, card.id)}
              />
            )
          }
          onSwap={swapPDrinkIds}
          size={size}
        />
      ))}
    </div>
  );
}

export default memo(StagePDrinks);
