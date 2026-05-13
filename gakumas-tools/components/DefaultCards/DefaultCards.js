import { memo } from "react";
import { useTranslations } from "next-intl";
import { FaCirclePlus } from "react-icons/fa6";
import { SkillCards } from "gakumas-data";
import gkImg from "gakumas-images";
import Image from "@/components/Image";
import styles from "./DefaultCards.module.scss";

function DefaultCards({ skillCardIds, onClickAddCards }) {
  const t = useTranslations("SimulatorSubTools");
  const defaultCards = skillCardIds.map(SkillCards.getById);

  return (
    <div className={styles.list}>
      {defaultCards.map((skillCard, index) => (
        <Image
          key={`${index}_${skillCard.id}`}
          src={gkImg(skillCard).icon}
          alt={skillCard.name}
          width={60}
          height={60}
        />
      ))}
      {onClickAddCards && (
        <button className={styles.addCardsButton} onClick={onClickAddCards}>
          <FaCirclePlus size={"2em"} title={t("addCards")} />
        </button>
      )}
    </div>
  );
}

export default memo(DefaultCards);
