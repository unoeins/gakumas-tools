import { memo } from "react";
import { useTranslations } from "next-intl";
import { S } from "gakumas-engine/constants";
import TurnTypeIcon from "@/components/TurnTypeOrder/TurnTypeIcon";
import styles from "./ContestPlayer.module.scss";

function TurnTypeViewer({ state }) {
  const t = useTranslations("ContestPlayer");

  const turnTypes = Array.from({ length: state[S.turnsElapsed] + state[S.turnsRemaining] },
    (_, i) => state[S.turnTypes][Math.min(i, state[S.turnTypes].length - 1)]
  ); 

  return (
    <div className={styles.turnViewer}>
      {turnTypes.map((turnType, i) => (
        <TurnTypeIcon
          key={i}
          turnType={i >= state[S.turnsElapsed] ? turnType : "elapsed"}
          label={i + 1}
          size="fill"
        />
      ))}
    </div>
  );
}

export default memo(TurnTypeViewer);
