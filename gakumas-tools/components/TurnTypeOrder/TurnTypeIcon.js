import { memo } from "react";
import { useDrag, useDrop } from "@/utils/safeDnd";
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
  
  const [{ isDragging }, dragRef] = useDrag({
    type: "TURN_TYPE_ICON",
    item: { index },
  });

  const [, dropRef] = useDrop({
    accept: "TURN_TYPE_ICON",
    drop: (item) => {
      if (onSwap) {
        onSwap(item.index, index);
      }
    },
  });
  
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
      <button ref={dragRef} className={className} onClick={() => onClick(turnType)}>
        <div ref={dropRef} className={styles.dropArea}>
          {unwrappedElement}
        </div>
      </button>
    );
  } else {
    return <div className={className}>{unwrappedElement}</div>;
  }
}

export default memo(TurnTypeIcon);
