import { memo } from "react";
import { useTranslations } from "next-intl";
import styles from "./SkillCardOrderGroups.module.scss";
import LoadoutSkillCardOrderGroup from "./LoadoutSkillCardOrderGroup";

function SkillCardOrderGroups({
  skillCardIdOrderGroups,
  customizationOrderGroups,
  idolId,
  defaultCardIds,
  removedCardOrder,
  setRemovedCardOrder,
}) {
  const t = useTranslations("SkillCardOrderGroups");
  return (
    <>
        <div className={styles.skillCardOrderGroups}>
            {skillCardIdOrderGroups.map((skillCardIdOrderGroup, i) => (
              <LoadoutSkillCardOrderGroup
                key={i}
                skillCardIdOrderGroup={skillCardIdOrderGroup}
                customizationOrderGroup={customizationOrderGroups[i]}
                groupIndex={i}
                idolId={idolId}
                defaultCardIds={defaultCardIds}
              />
            ))}
        </div>
        <div className={styles.removedCardOrder}>
          <div className={styles.removedCardOrderHeader}>{t("removed_card_order_header")}</div>
          <select className={styles.removedCardOrderSelect}
            value={removedCardOrder} 
            onChange={(e) => setRemovedCardOrder(e.target.value)}>
            <option value="random">{t("removed_card_random")}</option>
            <option value="skip">{t("removed_card_skip")}</option>
          </select>
        </div>
    </>
  );
}

export default memo(SkillCardOrderGroups);
