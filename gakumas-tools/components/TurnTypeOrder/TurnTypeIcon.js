import { memo } from "react";
import c from "@/utils/classNames";
import styles from "./TurnTypeOrder.module.scss";

function TurnTypeIcon({
  turnType,
  label,
  size = "large",
  onClick,
}) {
  let unwrappedElement = null;
  if (label != null) {
    unwrappedElement = (
      <span className={styles.label}>{label}</span>
    );
  }
  const className = c(
    styles.turnTypeIcon,
    styles[size],
    turnType && styles[turnType]
  );

  if (onClick) {
    return (
      <button className={className} onClick={() => onClick(turnType)}>
        {unwrappedElement}
      </button>
    );
  } else {
    return <div className={className}>{unwrappedElement}</div>;
  }
}

export default memo(TurnTypeIcon);
