import React, { useEffect } from "react";
import classNames from "classnames";
import type { DraggableSyntheticListeners } from "@dnd-kit/core";
import type { Transform } from "@dnd-kit/utilities";

import styles from "./Item.module.css";

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

export const Item = React.forwardRef<HTMLLIElement, Props>(
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
        style={{
          transition: [transition].filter(Boolean).join(", "),
          transform: `translate3d(0,${
            transform ? `${Math.round(transform.y)}px` : 0
          }, 0)`,
        }}
        ref={ref}
      >
        <div
          className={classNames(
            styles.Item,
            dragging && styles.dragging,
            dragOverlay && styles.dragOverlay
          )}
          {...listeners}
          {...props}
          tabIndex={0}
        >
          {value}
        </div>
      </li>
    );
  }
);
