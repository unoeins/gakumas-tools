import { memo, useContext } from "react";
import SwapButtonContext from "@/components/EntityIcon/SwapButtonContext";
import c from "@/utils/classNames";
import styles from "./TurnTypeOrder.module.scss";

function TurnTypeIcon({
  turnType,
  label,
  index,
  size = "large",
  onClick,
  onSwap,
}) {
  const SwapButton = useContext(SwapButtonContext);
  
  let unwrappedElement = null;
  if (label != null) {
    unwrappedElement = (
      <span className={styles.label}>{label}</span>
    );
  }
  const className = c(
    styles.turnTypeIcon,
    turnType && turnType != "none" ? styles.filled : styles.empty,
    styles[size],
    turnType && styles[turnType]
  );

  if (!onClick) {
    return <div className={className}>{unwrappedElement}</div>;
  }
  
  const contents = (
    <div className={styles.dropArea}>
      {unwrappedElement}
    </div>
  );
  const buttonProps = {
    className,
    onClick: () => onClick(turnType),
  };

  if (onSwap && SwapButton) {
    const swap = {
      type: "TURN_TYPE",
      dndType: "TURN_TYPE_ICON",
      index,
      id: turnType === "none" ? 0 : turnType,
      onSwap
    };
    return (
      <SwapButton swap={swap} {...buttonProps}>
        {contents}
      </SwapButton>
    );
  }
  return <button {...buttonProps}>{contents}</button>;
}

export default memo(TurnTypeIcon);
