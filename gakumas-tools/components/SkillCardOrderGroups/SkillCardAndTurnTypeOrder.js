import { memo, useContext } from "react";
import { useTranslations } from "next-intl";
import LoadoutContext from "@/contexts/LoadoutContext";
import SkillCardOrderGroups from "./SkillCardOrderGroups";
import TurnTypeOrder from "@/components/TurnTypeOrder";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
import ModalContext from "@/contexts/ModalContext";
import styles from "./SkillCardOrderGroups.module.scss";

function SkillCardAndTurnTypeOrder({
  idolId,
  defaultCardIds,
}) {
  const t = useTranslations("SkillCardOrderGroups");
  const { loadout, setRemovedCardOrder, clearOrders } = useContext(LoadoutContext);
  const { setModal } = useContext(ModalContext);
  return (
    <>
      <SkillCardOrderGroups
        skillCardIdOrderGroups={loadout.skillCardIdOrderGroups}
        customizationOrderGroups={loadout.customizationOrderGroups}
        idolId={idolId}
        defaultCardIds={defaultCardIds}
        removedCardOrder={loadout.removedCardOrder}
        setRemovedCardOrder={setRemovedCardOrder}
      />
      <TurnTypeOrder
        turnTypeOrder={loadout.turnTypeOrder}
      />
      <div className={styles.buttons}>
        <Button
          style="red-secondary"
          onClick={() =>
            setModal(<ConfirmModal message={t("confirmClearOrders")} onConfirm={clearOrders} />)
          }
        >
          {t("clearOrders")}
        </Button>
      </div>
    </>
  );
}

export default memo(SkillCardAndTurnTypeOrder);
