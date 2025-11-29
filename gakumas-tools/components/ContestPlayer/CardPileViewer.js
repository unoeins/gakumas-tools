import { memo, useState } from "react";
import { useTranslations } from "next-intl";
import { S } from "gakumas-engine/constants";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import c from "@/utils/classNames";
import styles from "./ContestPlayer.module.scss";

function CardPileViewer({
    state,
    type,
    scores,
    onClick,
    onSkip,
    idolId,
    plan,
    reverse = false,
    size = "large"}) {
  const t = useTranslations("ContestPlayer");
  const className = c(
    styles.cardPileData,
    styles[size],
    styles[type]
  );

  let cards = state[S[type]];
  if (reverse) {
    cards = [...cards].reverse();
  }

  return (
    <div id={"cardPileViewer_" + type} className={styles.cardPileViewer}>
      <div className={styles.cardPileHeader}>
        <label>{t(type)}</label>
      </div>
      <div className={className}>
        {cards.map((card, i) => (
          <div className={styles.cardPileCard} key={i}>
            <EntityIcon
              type={EntityTypes.SKILL_CARD}
              id={state[S.cardMap][card].id}
              customizations={state[S.cardMap][card].c11n}
              onClick={onClick ? () =>  onClick(i) : undefined}
              idolId={idolId}
              size={"fill"}
            />
            {scores && <div className={styles.score}>
              {scores[i] != -Infinity ? scores[i] : t("unplayable")}
            </div>}
          </div>
        ))}
        {onSkip && (
          <div className={styles.cardPileCard}>
            <EntityIcon
              type={EntityTypes.SKILL_CARD}
              id={0}
              label={"SKIP"}
              onClick={() =>  onSkip()}
              idolId={idolId}
              size={"fill"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(CardPileViewer);
