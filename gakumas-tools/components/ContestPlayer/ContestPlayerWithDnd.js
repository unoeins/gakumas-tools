"use client";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import ContestPlayer from "./ContestPlayer";

export default function ContestPlayerWithDnd() {
  return (
    <DndProvider backend={HTML5Backend}>
      <ContestPlayer />
    </DndProvider>
  );
}
