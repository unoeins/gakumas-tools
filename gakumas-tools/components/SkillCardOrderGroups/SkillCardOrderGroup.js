import { memo, useContext, useState } from "react";
import { useTranslations } from "next-intl";
import {
  FaCirclePlus,
  FaCircleXmark,
} from "react-icons/fa6";
import LoadoutContext from "@/contexts/LoadoutContext";
import c from "@/utils/classNames";
import styles from "./SkillCardOrderGroups.module.scss";
import SkillCardOrder from "./SkillCardOrder";

function SkillCardOrderGroup({
  skillCardIdOrderGroup,
  customizationOrderGroup,
  groupIndex,
  idolId,
  defaultCardIds,
}) {
  const t = useTranslations("SkillCardOrderGroups");
  const {
    loadout,
    replaceSkillCardOrder,
    swapSkillCardOrder,
    insertSkillCardOrderGroup,
    deleteSkillCardOrderGroup,
  } = useContext(LoadoutContext);
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={styles.skillCardOrderGroup}>
      <SkillCardOrder
        skillCardIdOrderGroup={skillCardIdOrderGroup}
        customizationOrderGroup={customizationOrderGroup}
        replaceSkillCardOrder={replaceSkillCardOrder}
        swapSkillCardOrder={swapSkillCardOrder}
        idolId={idolId}
        groupIndex={groupIndex}
        defaultCardIds={defaultCardIds}
      />

      <div className={styles.sub}>
        <div className={styles.index}>
          {t("Nth_order", { n: groupIndex + 1 })}
        </div>
        <div
          className={c(styles.buttonGroup, expanded && styles.expanded)}
          onClick={() => setExpanded(false)}
        >

          <button
            className={styles.addButton}
            onClick={() => insertSkillCardOrderGroup(groupIndex + 1)}
          >
            <FaCirclePlus />
          </button>

          <button
            className={styles.deleteButton}
            onClick={() => deleteSkillCardOrderGroup(groupIndex)}
            disabled={loadout.skillCardIdOrderGroups.length < 2}
          >
            <FaCircleXmark />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(SkillCardOrderGroup);
