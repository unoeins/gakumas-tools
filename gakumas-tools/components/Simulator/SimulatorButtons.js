"use client";
import { memo, useContext, useState } from "react";
import { useTranslations } from "next-intl";
import { FaCheck, FaRegCopy, FaRegPaste } from "react-icons/fa6";
import { Stages } from "gakumas-data";
import Button from "@/components/Button";
import ConfirmModal from "@/components/ConfirmModal";
import LoadoutManagerModal from "@/components/LoadoutManagerModal";
import LoadoutContext from "@/contexts/LoadoutContext";
import ModalContext from "@/contexts/ModalContext";
import { loadoutFromSearchParams } from "@/utils/simulator";
import styles from "./Simulator.module.scss";

function SimulatorButtons() {
  const t = useTranslations("SimulatorButtons");

  const { clear, simulatorUrl, stage, setLoadout, setLoadouts, currentLoadoutIndex } = useContext(LoadoutContext);
  const { setModal } = useContext(ModalContext);
  const [linkCopied, setLinkCopied] = useState(false);

  async function readLoadoutFromUrl() {
    try {
      const text = await navigator.clipboard.readText();
      if (!/^https?:\/\/.+/i.test(text)) {
        setModal(<ConfirmModal message={t("invalidUrl")} showCancel={false} />);
        return;
      }
      const url = new URL(text);
      const loadout = loadoutFromSearchParams(url.searchParams);
      if (loadout.hasDataFromParams) {
        setModal(<ConfirmModal message={t("confirmSetLoadout")} onConfirm={() => {
          if (loadout.stageId !== "custom" && Stages.getById(loadout.stageId)?.type === "linkContest") {
            setLoadout(loadout.loadouts[currentLoadoutIndex]);
            setLoadouts(loadout.loadouts);
          } else {
            setLoadout(loadout);
          }
        }} />);
      } else {
        setModal(<ConfirmModal message={t("invalidLoadout")} showCancel={false} />);
      }
    } catch (err) {
      console.error("Clipboard error:", err);
      setModal(<ConfirmModal message={t("clipboardError")} showCancel={false} />);
    }
  }

  return (
    <div className={styles.buttons}>
      <Button
        style="red-secondary"
        onClick={() =>
          setModal(<ConfirmModal message={t("confirm")} onConfirm={clear} />)
        }
      >
        {t("clear")}
      </Button>

      {stage.type !== "linkContest" && (
        <>
          <Button
            style="blue-secondary"
            onClick={() => setModal(<LoadoutManagerModal />)}
          >
            {t("manageLoadouts")}
          </Button>
        </>
      )}

      <Button
        style="blue-secondary"
        onClick={() => {
          navigator.clipboard.writeText(simulatorUrl);
          setLinkCopied(true);
          setTimeout(() => setLinkCopied(false), 3000);
        }}
      >
        {linkCopied ? (
          <FaCheck />
        ) : (
          <>
            <FaRegCopy />
            URL
          </>
        )}
      </Button>

      <Button
        style="blue-secondary"
        onClick={() => readLoadoutFromUrl()}
      >
        <FaRegPaste />
        {t("readLoadoutFromUrl")}
      </Button>

    </div>
  );
}

export default memo(SimulatorButtons);
