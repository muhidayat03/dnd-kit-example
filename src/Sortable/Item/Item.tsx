import React, { useEffect } from "react";
import classNames from "classnames";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";

import styles from "./Item.module.scss";

export interface Props {
  dragOverlay?: boolean;
  dragging?: boolean;
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
}

export const Item = React.memo(
  React.forwardRef<HTMLLIElement, Props>(
    (
      {
        dragOverlay,
        dragging,
        fadeIn,
        height,
        index,
        listeners,
        sorting,
        transition,
        transform,
        value,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragging) {
          return;
        }

        document.body.style.cursor = "grabbing";

        return () => {
          document.body.style.cursor = "";
        };
      }, [dragging]);

      return (
        <li
          className={classNames(
            styles.Wrapper,
            fadeIn && styles.fadeIn,
            sorting && styles.sorting,
            dragOverlay && styles.dragOverlay
          )}
          style={
            {
              transition: [transition].filter(Boolean).join(", "),
              "--translate-x": transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              "--translate-y": transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              "--scale-x": transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              "--scale-y": transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              "--index": index,
            } as React.CSSProperties
          }
          ref={ref}
        >
          <div
            className={classNames(
              styles.Item,
              dragging && styles.dragging,
              dragOverlay && styles.dragOverlay
            )}
            data-cypress="draggable-item"
            {...listeners}
            {...props}
            tabIndex={0}
          >
            {value}
          </div>
        </li>
      );
    }
  )
);