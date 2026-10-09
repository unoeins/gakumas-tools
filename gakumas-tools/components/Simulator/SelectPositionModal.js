import { useState, Fragment } from "react";
import { useTranslations } from "next-intl";
import { SkillCards, PDrinks, PItems } from "gakumas-data";
import { S } from "gakumas-engine";
import gkImg from "gakumas-images";
import Image from "@/components/Image";
import Button from "@/components/Button";
import EntityIcon from "@/components/EntityIcon";
import Modal from "@/components/Modal";
import c from "@/utils/classNames";
import { EntityTypes } from "@/utils/entities";
import styles from "./ManualPlay.module.scss";

export default function SelectPositionModal({ decision, onDecision, idolId }) {
  const t = useTranslations("stage");
  const { state, cards, reverse, num, optional = false, isRawId = false } = decision;
  const [selectedIndices, setSelectedIndices] = useState([]);

  const cardsToShow = reverse ? cards.toReversed() : cards;

  let resolvedEntity = null;
  if (state[S.phase] == "processCard") {
    resolvedEntity = SkillCards.getById(state[S.cardMap][state[S.usedCard]].id);
  } else if (state[S.phase] == "processDrink") {
    resolvedEntity = PDrinks.getById(state[S.usedDrink]);
  } else if (["skillCard", "skillCardEffect", "hifAbility"]
      .includes(state[S.triggeredEffect]?.source?.type)) {
    resolvedEntity = SkillCards.getById(state[S.triggeredEffect].source?.id);
  } else if (["pItem", "pItemEffect"].includes(state[S.triggeredEffect]?.source?.type)) {
    resolvedEntity = PItems.getById(state[S.triggeredEffect].source?.id);
  } else if (["pDrink", "pDrinkEffect"].includes(state[S.triggeredEffect]?.source?.type)) {
    resolvedEntity = PDrinks.getById(state[S.triggeredEffect].source?.id);
  }
  const { icon } = gkImg(resolvedEntity, idolId);

  const promptKey = "selectPositionToInsertCard";

  const toggleCard = (arrayIndex) => {
    setSelectedIndices((prev) => {
      if (prev.includes(arrayIndex)) {
        return prev.filter((i) => i !== arrayIndex);
      } else if (prev.length < num) {
        return [...prev, arrayIndex];
      }
      return prev;
    });
  };

  return (
    <Modal dismissable={false}>
      {state[S.phase] == "processCard" && (
        <div className={styles.entity}>
          <Image src={icon} width={24} height={24} alt="" />
          {t("skillCard")}「{resolvedEntity.name}」
        </div>
      )}
      {state[S.phase] == "processDrink" && (
        <div className={styles.entity}>
          <Image src={icon} width={24} height={24} alt="" />
          {t("pDrink")}「{resolvedEntity.name}」
        </div>
      )}
      {state[S.phase] != "processCard" && state[S.phase] != "processDrink" && (
        <div className={styles.entity}>
          {resolvedEntity && <Image src={icon} width={24} height={24} alt="" />}
          {t("effect")}{resolvedEntity ? `「${resolvedEntity.name}」` : ""}
        </div>
      )}
      <h3>
        {t(promptKey, { num })}
      </h3>
      <div className={styles.cardGrid}>
          <button
            className={c(styles.holdCard, selectedIndices.includes(reverse ? cards.length : 0) && styles.selected)}
            onClick={() => toggleCard(reverse ? cards.length : 0)}
          >
            <div className={styles.imgWrapper}>
              <EntityIcon
                type={EntityTypes.SKILL_CARD}
                id={0}
                label={0}
                idolId={idolId}
                size="fill"
              />
            </div>
          </button>
        {cardsToShow.map((cardIndex, arrayIndex) => {
          const card = isRawId ? { id: cardIndex } : state[S.cardMap][cardIndex];
          const selectIndex = reverse ? cards.length - arrayIndex - 1 : arrayIndex + 1;
          const isSelected = selectedIndices.includes(selectIndex);
          return (
            <Fragment key={arrayIndex}>
              <button className={c(styles.holdCard)}>
                <div className={styles.imgWrapper}>
                  <EntityIcon
                    type={EntityTypes.SKILL_CARD}
                    id={card.id}
                    customizations={card.c11n}
                    idolId={idolId}
                    size="fill"
                  />
                </div>
                {SkillCards.getById(card.id).name}
              </button>
              <button
                className={c(styles.holdCard, isSelected && styles.selected)}
                onClick={() => toggleCard(selectIndex)}
              >
                <div className={styles.imgWrapper}>
                  <EntityIcon
                    type={EntityTypes.SKILL_CARD}
                    id={0}
                    label={arrayIndex + 1}
                    idolId={idolId}
                    size="fill"
                  />
                </div>
              </button>
            </Fragment>
          );
        })}
      </div>
      <Button
        style="blue"
        fill
        onClick={() => onDecision(selectedIndices)}
        disabled={!optional && selectedIndices.length < num}
      >
        {t("confirm")} ({selectedIndices.length}/{num})
      </Button>
    </Modal>
  );
}
