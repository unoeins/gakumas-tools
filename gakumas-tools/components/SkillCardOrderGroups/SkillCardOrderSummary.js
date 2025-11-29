import { memo } from "react";
import { SkillCards } from "gakumas-data";
import gkImg from "gakumas-images";
import Image from "@/components/Image";
import styles from "./SkillCardOrderGroups.module.scss";

function SkillCardOrderSummary({ loadout }) {
  return (
    <div className={styles.summary}>
      {loadout.skillCardIdOrderGroups.map((group, j) => (
        <div key={j}>
          {group
            .map(SkillCards.getById)
            .filter((c) => c)
            .map((skillCard, i) => (
              <Image
                key={i}
                src={gkImg(skillCard).icon}
                width={40}
                height={40}
                alt={skillCard.name}
                draggable={false}
              />
            ))}
        </div>
      ))}
    </div>
  );
}

export default memo(SkillCardOrderSummary);
