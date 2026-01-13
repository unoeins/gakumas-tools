import { memo } from "react";
import { useTranslations } from "next-intl";
import { S } from "gakumas-engine/constants";
import EntityIcon from "@/components/EntityIcon";
import { EntityTypes } from "@/utils/entities";
import c from "@/utils/classNames";
import styles from "./ContestPlayer.module.scss";

function EntitiesViewer({
    state,
    type,
    name,
    scores,
    onClick,
    onSkip,
    idolId,
    reverse = false,
    size = "large"}) {
  const t = useTranslations("ContestPlayer");
  const className = c(
    styles.cardPileData,
    styles[size],
    styles[name]
  );

  let entities = state[S[name]];
  if (reverse) {
    entities = [...entities].reverse();
  }
  if (type == EntityTypes.SKILL_CARD) {
    entities = entities.map(e => state[S.cardMap][e]);
  } else {
    entities = entities.map(e => ({ id: e }));
  }

  return (
    <div id={"entitiesViewer_" + name} className={styles.cardPileViewer}>
      <div className={styles.cardPileHeader}>
        <label>{t(name)}</label>
      </div>
      <div className={className}>
        {entities.map((entity, i) => (
          <div className={styles.cardPileCard} key={i}>
            <EntityIcon
              type={type}
              id={entity.id}
              customizations={entity.c11n}
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
              type={type}
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

export default memo(EntitiesViewer);
