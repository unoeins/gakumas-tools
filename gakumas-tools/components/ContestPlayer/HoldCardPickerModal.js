import { memo, useContext } from "react";
import { S } from "gakumas-engine/constants";
import EntityIcon from "@/components/EntityIcon";
import Modal from "@/components/Modal";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./ContestPlayer.module.scss";

function HoldCardPickerModal({
  state,
  cards,
  disabledIndices,
  idolId,
  onPick,
}) {
  const { closeModal } = useContext(ModalContext);

  const filteredCards = 
    cards.map((card, index) => ({card, index})).
    filter(({index}) => !disabledIndices.includes(index));

  return (
    <Modal closable={false}>
      <div className={styles.entities}>
      {filteredCards.map(({card, index}) => (
        <EntityIcon
          key={index}
          index={index}
          type={EntityTypes.SKILL_CARD}
          id={state[S.cardMap][card].id}
          customizations={state[S.cardMap][card].c11n}
          idolId={idolId}
          onClick={(index) => {
            onPick(index);
            closeModal();
          }}
          size="fill"
          argumentType="index"
        />
      ))}
      </div>
    </Modal>
  );
}

export default memo(HoldCardPickerModal);
