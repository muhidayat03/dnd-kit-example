import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  Announcements,
  closestCenter,
  CollisionDetection,
  DragOverlay,
  DndContext,
  DropAnimation,
  defaultDropAnimation,
  KeyboardCoordinateGetter,
  MouseSensor,
  MeasuringConfiguration,
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
  AnimateLayoutChanges,
  NewIndexGetter,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { createRange } from "./utilities";
import { Item, Wrapper } from "./components";

export interface Props {
  activationConstraint?: PointerActivationConstraint;
  animateLayoutChanges?: AnimateLayoutChanges;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  dropAnimation?: DropAnimation | null;
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  itemCount?: number;
  items?: string[];
  reorderItems?: typeof arrayMove;
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

export function Sortable({
  animateLayoutChanges,
  collisionDetection = closestCenter,
  dropAnimation = defaultDropAnimationConfig,
  getNewIndex,
  handle = false,
  itemCount = 16,
  items: initialItems,
  isDisabled = () => false,
  reorderItems = arrayMove,
}: Props) {
  const [items, setItems] = useState<string[]>(
    () =>
      initialItems ??
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
  const getPosition = (id: string) => getIndex(id) + 1;
  const activeIndex = activeId ? getIndex(activeId) : -1;
  const announcements: Announcements = {
    onDragStart(id) {
      return `Picked up sortable item ${id}. Sortable item ${id} is in position ${getPosition(
        id
      )} of ${items.length}`;
    },
    onDragOver(id, overId) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (overId) {
        return `Sortable item ${id} was moved into position ${getPosition(
          overId
        )} of ${items.length}`;
      }

      return;
    },
    onDragEnd(id, overId) {
      if (overId) {
        return `Sortable item ${id} was dropped at position ${getPosition(
          overId
        )} of ${items.length}`;
      }

      return;
    },
    onDragCancel(id) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id
      )} of ${items.length}.`;
    },
  };

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  return (
    <DndContext
      announcements={announcements}
      screenReaderInstructions={screenReaderInstructions}
      sensors={sensors}
      collisionDetection={collisionDetection}
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
            setItems((items) => reorderItems(items, activeIndex, overIndex));
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <Wrapper center>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ul>
            {items.map((value, index) => (
              <SortableItem
                key={value}
                id={value}
                handle={handle}
                index={index}
                disabled={isDisabled(value)}
                animateLayoutChanges={animateLayoutChanges}
                getNewIndex={getNewIndex}
              />
            ))}
          </ul>
        </SortableContext>
      </Wrapper>
      {createPortal(
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId ? (
            <Item value={items[activeIndex]} handle={handle} dragOverlay />
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

interface SortableItemProps {
  animateLayoutChanges?: AnimateLayoutChanges;
  disabled?: boolean;
  getNewIndex?: NewIndexGetter;
  id: string;
  index: number;
  handle: boolean;
  onRemove?(id: string): void;
}

export function SortableItem({
  disabled,
  animateLayoutChanges,
  getNewIndex,
  handle,
  id,
  index,
  onRemove,
}: SortableItemProps) {
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
    animateLayoutChanges,
    disabled,
    getNewIndex,
  });

  return (
    <Item
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
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
