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
  idolId,
  groupIndex = 0,
  defaultCardIds,
}) {
  const { setModal } = useContext(ModalContext);
  return (
    <div className={styles.skillCardOrderGroup}>
      {skillCardIdOrderGroup.map((cardId, i) => {
        const customizations = customizationOrderGroup[i] || {};
        return (
          <EntityIcon
            key={`${i}_${cardId}`}
            type={EntityTypes.SKILL_CARD}
            id={cardId}
            customizations={customizations}
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
            idolId={idolId}
            size="fill"
          />
        );
      })}
    </div>
  );
}

export default memo(SkillCardOrder);
