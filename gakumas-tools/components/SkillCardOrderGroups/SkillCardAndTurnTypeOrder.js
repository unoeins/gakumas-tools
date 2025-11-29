import { memo, useContext } from "react";
import { useTranslations } from "next-intl";
import LoadoutContext from "@/contexts/LoadoutContext";
import TurnTypeOrder from "@/components/TurnTypeOrder";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
import ModalContext from "@/contexts/ModalContext";
import SkillCardOrderEditor from "./SkillCardOrderEditor";
import SkillCardOrderSummary from "./SkillCardOrderSummary";
import styles from "./SkillCardOrderGroups.module.scss";

const LINK_PHASES = ["OP", "MID", "ED"];

function SkillCardAndTurnTypeOrder({
  config,
  idolId,
  defaultCardIds,
}) {
  const t = useTranslations("SkillCardOrderGroups");
  const {
    stage,
    loadout,
    loadouts,
    setLoadout,
    currentLoadoutIndex,
    setCurrentLoadoutIndex,
    setRemovedCardOrder,
    clearOrders
  } = useContext(LoadoutContext);
  const { setModal } = useContext(ModalContext);
  return (
    <>
      {stage.type == "linkContest" ? (
        <div className={styles.skillCardOrderTabs}>
          {loadouts.map((loadout, index) => (
            <div key={index} className={styles.skillCardOrderTab}>
              <button
                className={styles.selectButton}
                onClick={() => {
                  setLoadout(loadouts[index]);
                  setCurrentLoadoutIndex(index);
                }}
              >
                {LINK_PHASES[index]}
              </button>
              {index === currentLoadoutIndex ? (
                <SkillCardOrderEditor
                  config={config}
                  idolId={idolId}
                  defaultCardIds={defaultCardIds}
                />
              ) : (
                <div
                  className={styles.skillCardOrderSummary}
                  onClick={() => {
                    setLoadout(loadouts[index]);
                    setCurrentLoadoutIndex(index);
                  }}
                >
                  <SkillCardOrderSummary loadout={loadout} showStage={false} idolId={idolId} />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <SkillCardOrderEditor
          config={config}
          idolId={idolId}
          defaultCardIds={defaultCardIds}
        />
      )}
      <div className={styles.removedCardOrder}>
        <div className={styles.removedCardOrderHeader}>{t("removed_card_order_header")}</div>
        <select className={styles.removedCardOrderSelect}
          value={loadout.removedCardOrder} 
          onChange={(e) => setRemovedCardOrder(e.target.value)}>
          <option value="random">{t("removed_card_random")}</option>
          <option value="skip">{t("removed_card_skip")}</option>
        </select>
      </div>
      {/* <SkillCardOrderGroups
        skillCardIdOrderGroups={loadout.skillCardIdOrderGroups}
        customizationOrderGroups={loadout.customizationOrderGroups}
        idolId={idolId}
        defaultCardIds={defaultCardIds}
        removedCardOrder={loadout.removedCardOrder}
        setRemovedCardOrder={setRemovedCardOrder}
      /> */}
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
