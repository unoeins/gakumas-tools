import { memo, useContext } from "react";
import EntityIcon from "@/components/EntityIcon";
import EntityPickerModal from "@/components/EntityPickerModal";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./StagePItems.module.scss";

function StagePItems({ pItemIds, replacePItemId, swapPItemIds, indications, size, stage }) {
  const { setModal } = useContext(ModalContext);

  let filters = [{ callback: (e) => e.sourceType != "produce" }];
  if (stage && stage.type === "exam") {
    filters = [];
  }

  return (
    <div className={styles.stagePItems}>
      {pItemIds.map((pItemId, index) => (
        <EntityIcon
          key={`${index}_${pItemId}`}
          type={EntityTypes.P_ITEM}
          id={pItemId}
          index={index}
          indications={indications?.[index]}
          onClick={() =>
            setModal(
              <EntityPickerModal
                type={EntityTypes.P_ITEM}
                onPick={(card) => replacePItemId(index, card.id)}
                filters={filters}
              />
            )
          }
          onSwap={swapPItemIds}
          size={size}
        />
      ))}
    </div>
  );
}

export default memo(StagePItems);
