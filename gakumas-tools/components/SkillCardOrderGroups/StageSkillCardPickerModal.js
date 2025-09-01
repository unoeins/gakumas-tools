import { memo, useContext } from "react";
import EntityIcon from "@/components/EntityIcon";
import Modal from "@/components/Modal";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./SkillCardOrderGroups.module.scss";
import LoadoutContext from "@/contexts/LoadoutContext";

function StageSkillCardPickerModal({
  idolId,
  onPick,
  defaultCardIds,
  includeNull = true,
}) {
  const { closeModal } = useContext(ModalContext);
  const {
    loadout,
  } = useContext(LoadoutContext);

  let skillCardIds = [].concat(...loadout.skillCardIdGroups, defaultCardIds);
  let customizations = [].concat(...loadout.customizationGroups);
  if(includeNull) {
    skillCardIds.push(0);
    customizations.push({});
  }

  return (
    <Modal>
      <div className={styles.entities}>
      {skillCardIds.map((skillCardId, index) => (
          <EntityIcon
            key={`${skillCardId}_${index}`}
            type={EntityTypes.SKILL_CARD}
            id={skillCardId}
            customizations={customizations[index] || {}}
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

export default memo(StageSkillCardPickerModal);
