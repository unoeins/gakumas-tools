import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import EntityIcon from "@/components/EntityIcon";
import TurnTypeIcon from "@/components/TurnTypeOrder/TurnTypeIcon";
import SwapButtonContext from "@/components/EntityIcon/SwapButtonContext";
import SwappableButton from "@/components/EntityIcon/SwappableButton";
import c from "@/utils/classNames";
import styles from "./LoadoutEditor.module.scss";

export default function SwapDndContext({ children, type="entity" }) {
  const [dragged, setDragged] = useState(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    })
  );

  function handleDragStart({ active }) {
    console.log("drag start", active);
    setDragged(active.data.current);
    navigator.vibrate?.(8);
  }

  function handleDragEnd({ active, over }) {
    console.log("drag end", active, over);
    setDragged(null);
    const from = active.data.current;
    const to = over?.data.current;
    if (!to || to.type != from.type || to.dndType != from.dndType || over.id == active.id) return;
    from.onSwap(from.index, to.index);
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setDragged(null)}
    >
      <SwapButtonContext.Provider value={SwappableButton}>
        {children}
      </SwapButtonContext.Provider>
      <DragOverlay dropAnimation={null}>
        {dragged && type === "entity" && (
          <div className={styles.dragOverlay}>
            <EntityIcon
              type={dragged.type}
              id={dragged.id}
              idolId={dragged.idolId}
              customizations={dragged.customizations}
              size="fill"
            />
          </div>
        )}
        {dragged && type === "turnType" && (
          <div className={c(styles.dragOverlay, styles.turnTypeIcon)}>
            <TurnTypeIcon
              turnType={dragged.id}
              label={dragged.index + 1}
              index={dragged.index}
              size="fill"
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
