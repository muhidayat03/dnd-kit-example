import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  closestCenter,
  DragOverlay,
  DndContext,
  DropAnimation,
  defaultDropAnimation,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { Item } from "./Item";
import { createRange } from "./createRange";

export interface Props {
  itemCount?: number;
  items?: string[];
}

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const activationConstraint = {
  delay: 250,
  tolerance: 5,
};

export function Sortable({ itemCount = 16 }: Props) {
  const [items, setItems] = useState<string[]>(() =>
    createRange<string>(itemCount, (index: any) => (index + 1).toString())
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    })
  );

  const isFirstAnnouncement = useRef(true);

  const getIndex = items.indexOf.bind(items);

  const activeIndex = activeId ? getIndex(activeId) : -1;

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={({ active }) => {
        if (!active) {
          return;
        }

        setActiveId(active.id);
      }}
      onDragEnd={({ over }) => {
        setActiveId(null);

        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => arrayMove(items, activeIndex, overIndex));
          }
        }

        console.log("end");
      }}
      onDragCancel={() => {
        setActiveId(null);
        console.log("cancel");
      }}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div style={{ width: 400, margin: "auto", padding: 100 }}>
          <ul style={{ margin: 0, padding: 0 }}>
            {items.map((value, index) => (
              <SortableItem key={value} id={value} index={index} />
            ))}
          </ul>
        </div>
      </SortableContext>

      {createPortal(
        <DragOverlay dropAnimation={defaultDropAnimationConfig}>
          {activeId ? <Item value={items[activeIndex]} dragOverlay /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

interface SortableItemProps {
  id: string;
  index: number;
}

export function SortableItem({ id, index }: SortableItemProps) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
  });

  return (
    <Item
      ref={setNodeRef}
      value={id}
      dragging={isDragging}
      sorting={isSorting}
      index={index}
      transform={transform}
      transition={transition}
      listeners={listeners}
      data-index={index}
      data-id={id}
      {...attributes}
    />
  );
}
