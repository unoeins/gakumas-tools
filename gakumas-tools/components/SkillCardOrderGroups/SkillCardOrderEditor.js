import { useContext } from "react";
import LoadoutContext from "@/contexts/LoadoutContext";
import { useTranslations } from "next-intl";
import styles from "./SkillCardOrderGroups.module.scss";
import SkillCardOrderGroup from "./SkillCardOrderGroup";

export default function SkillCardOrderEditor({ config, idolId }) {
  const t = useTranslations("SkillCardOrderGroups");
  const { loadout } = useContext(LoadoutContext);

  return (
    <div className={styles.skillCardOrderEditor}>
      {loadout.skillCardIdOrderGroups.map((skillCardIdOrderGroup, i) => (
        <SkillCardOrderGroup
          key={i}
          skillCardIdOrderGroup={skillCardIdOrderGroup}
          customizationOrderGroup={loadout.customizationOrderGroups[i]}
          groupIndex={i}
          idolId={idolId}
          defaultCardIds={config.defaultCardIds}
        />
      ))}
    </div>
  );
}
