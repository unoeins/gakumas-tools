import { memo } from "react";
import { useTranslations } from "next-intl";
import { PItems, PDrinks, SkillCards } from "gakumas-data";
import gkImg from "gakumas-images";
import Image from "@/components/Image";
import c from "@/utils/classNames";
import styles from "./EntityScore.module.scss";

function EntityScore({ entity, turnTypes, numRuns, idolId, turnTypeScore }) {
  const t = useTranslations("stage");
  let resolvedEntity = null;
  if (entity.type == "skillCard" || entity.type == "skillCardEffect") {
    resolvedEntity = SkillCards.getById(entity.id);
  } else if (entity.type == "pItem" || entity.type == "pItemEffect") {
    resolvedEntity = PItems.getById(entity.id);
  } else if (entity.type == "pDrink" || entity.type == "pDrinkEffect") {
    resolvedEntity = PDrinks.getById(entity.id);
  }

  const { icon } = gkImg(resolvedEntity, idolId);

  return (
    <div className={styles.entityScore}>
      <div className={styles.entity}>
        {entity.type == "default" && (
          <>
            {t("effect")}「{entity.id}」
          </>
        )}
        {entity.type == "stage" && t("stageEffect")}
        {entity.type == "skillCard" && (
          <>
            <Image src={icon} width={24} height={24} alt="" />
            {t("skillCard")}「{resolvedEntity.name}」
          </>
        )}
        {entity.type == "skillCardEffect" && (
          <>
            <div className={styles.effect}>
              <Image src={icon} width={24} height={24} alt="" />
            </div>
            {entity.effectType === "reservation" ? t("reservation") : t("effect")}「{resolvedEntity.name}」
          </>
        )}
        {entity.type == "pItem" && (
          <>
            <Image src={icon} width={24} height={24} alt="" />
            {t("pItem")}「{resolvedEntity.name}」
          </>
        )}
        {entity.type == "pItemEffect" && (
          <>
            <div className={styles.effect}>
              <Image src={icon} width={24} height={24} alt="" />
            </div>
            {entity.effectType === "reservation" ? t("reservation") : t("effect")}「{resolvedEntity.name}」
          </>
        )}
        {entity.type == "pDrink" && (
          <>
            <Image src={icon} width={24} height={24} alt="" />
            {t("pDrink")}「{resolvedEntity.name}」
          </>
        )}
        {entity.type == "pDrinkEffect" && (
          <>
            <div className={styles.effect}>
              <Image src={icon} width={24} height={24} alt="" />
            </div>
            {entity.effectType === "reservation" ? t("reservation") : t("effect")}「{resolvedEntity.name}」
          </>
        )}
      </div>
      <div className={c(styles.scores, turnTypeScore ? styles.turnTypeScores : styles.totalScore)}>
        {turnTypeScore ? (
          <>
            <div className={c(styles.score, styles.vocal)}>
              {(entity.scores.vocal / numRuns).toFixed(1)}
            </div>
            <div className={c(styles.score, styles.dance)}>
              {(entity.scores.dance / numRuns).toFixed(1)}
            </div>
            <div className={c(styles.score, styles.visual)}>
              {(entity.scores.visual / numRuns).toFixed(1)}
            </div>
          </>
        ) : (
          <>
            <div className={c(styles.score, styles.total)}>
              {((entity.scores.vocal + entity.scores.dance + entity.scores.visual) /
               (numRuns)).toFixed(1)}
            </div>
          </>
        )}
      </div>
    </div>
   );
}

export default memo(EntityScore);
