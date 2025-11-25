import { memo, useContext } from "react";
import EntityIcon from "@/components/EntityIcon";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./SkillCardOrderGroups.module.scss";
import StageSkillCardPickerModal from "./StageSkillCardPickerModal";

function SkillCardOrder({
  skillCardIdOrderGroup,
  customizationOrderGroup,
  replaceSkillCardOrder,
  swapSkillCardOrder,
  idolId,
  groupIndex = 0,
  defaultCardIds,
}) {
  const { setModal } = useContext(ModalContext);
  return (
    <div className={styles.skillCardOrder}>
      {skillCardIdOrderGroup.map((cardId, i) => {
        const customizations = customizationOrderGroup[i] || {};
        const index = groupIndex * skillCardIdOrderGroup.length + i;
        return (
          <EntityIcon
            key={`${i}_${cardId}`}
            type={EntityTypes.SKILL_CARD}
            id={cardId}
            customizations={customizations}
            label={i + 1}
            index={index}
            onClick={() =>
              setModal(
                <StageSkillCardPickerModal
                  onPick={(cardId, customizations) => {
                    replaceSkillCardOrder(groupIndex, i, cardId, customizations);
                  }}
                  idolId={idolId}
                  defaultCardIds={defaultCardIds}
                />
              )
            }
            onSwap={swapSkillCardOrder}
            dndType="SKILL_CARD_ORDER"
            idolId={idolId}
            size="fill"
          />
        );
      })}
    </div>
  );
}

export default memo(SkillCardOrder);
