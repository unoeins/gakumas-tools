import { memo, useContext } from "react";
import { useTranslations } from "next-intl";
import EntityIcon from "@/components/EntityIcon";
import EntityPickerModal from "@/components/EntityPickerModal";
import ModalContext from "@/contexts/ModalContext";
import { EntityTypes } from "@/utils/entities";
import styles from "./StageHifAbilities.module.scss";

function StageHifAbilities({ hifAbilityIds, replaceHifAbilityId, swapHifAbilityIds, size }) {
  const t = useTranslations("StageHifAbilities");
  const { setModal } = useContext(ModalContext);

  const filters = [{ callback: (e) => e.hifAbility?.length > 0 }];

  return (
    <>
      <label>{t("hifAbilities")}</label>
      <div className={styles.stageHifAbilities}>
        {hifAbilityIds.map((hifAbilityId, index) => (
          <EntityIcon
            key={`${index}_${hifAbilityId}`}
            type={EntityTypes.SKILL_CARD}
            id={hifAbilityId}
            index={index}
            onClick={() =>
              setModal(
                <EntityPickerModal
                  type={EntityTypes.SKILL_CARD}
                  onPick={(card) => replaceHifAbilityId(index, card.id)}
                  filters={filters}
                />
              )
            }
            onSwap={swapHifAbilityIds}
            dndType="HIF_ABILITY"
            size={size}
          />
        ))}
      </div>
    </>
  );
}

export default memo(StageHifAbilities);
