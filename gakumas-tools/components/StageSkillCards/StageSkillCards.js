import { memo, useContext } from "react";
import EntityIcon from "@/components/EntityIcon";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import c from "@/utils/classNames";
import styles from "./StageSkillCards.module.scss";
import EntityPickerModal from "../EntityPickerModal";

function StageSkillCards({
  skillCardIds,
  customizations,
  replaceSkillCardId,
  swapSkillCardIds,
  replaceCustomizations,
  indications,
  idolId,
  size,
  groupIndex = 0,
  stage,
}) {
  const { setModal } = useContext(ModalContext);
  const className = c(
    styles.stageSkillCards,
    stage && stage.type === "exam" && styles.examStageSkillCards
  );

  return (
    <div className={className}>
      {skillCardIds.map((skillCardId, index) => (
        <EntityIcon
          key={`${index}_${skillCardId}`}
          type={EntityTypes.SKILL_CARD}
          id={skillCardId}
          index={groupIndex * 6 + index}
          customizations={customizations?.[index]}
          indications={indications?.[index]}
          onClick={() =>
            setModal(
              <EntityPickerModal
                type={EntityTypes.SKILL_CARD}
                id={skillCardId}
                customizations={customizations?.[index]}
                onPick={(card) =>
                  replaceSkillCardId(groupIndex * 6 + index, card.id)
                }
                onCustomize={
                  replaceCustomizations
                    ? (customs) =>
                        replaceCustomizations(groupIndex * 6 + index, customs)
                    : null
                }
              />
            )
          }
          onSwap={swapSkillCardIds}
          idolId={idolId}
          size={size}
        />
      ))}
    </div>
  );
}

export default memo(StageSkillCards);
