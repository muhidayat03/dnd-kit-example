import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Announcements,
  closestCenter,
  DragOverlay,
  DndContext,
  DropAnimation,
  defaultDropAnimation,
  MouseSensor,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { createRange } from "./utilities";
import { Item, Wrapper } from "./components";

export interface Props {
  itemCount?: number;
  items?: string[];
  isDisabled?(id: UniqueIdentifier): boolean;
}

const defaultDropAnimationConfig: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};
const activationConstraint = {
  delay: 250,
  tolerance: 5,
};

export function Sortable({ itemCount = 16, isDisabled = () => false }: Props) {
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
      screenReaderInstructions={screenReaderInstructions}
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
      <Wrapper center>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul>
            {items.map((value, index) => (
              <SortableItem key={value} id={value} index={index} />
            ))}
          </ul>
        </SortableContext>
      </Wrapper>
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
