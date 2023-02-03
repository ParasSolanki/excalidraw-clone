import { nanoid } from "nanoid";
import type { Element, ElementOptions } from "@/types";

interface NewElementProps {
  type: Element["type"];
  x: number;
  y: number;
  clientX: number;
  clientY: number;
  options: ElementOptions;
}

function newElement({
  type,
  x,
  y,
  clientX,
  clientY,
  options,
}: NewElementProps) {
  const width = clientX - x;
  const height = clientY - y;

  if (type === "rectangle") {
    return {
      id: nanoid(),
      type,
      x,
      y,
      width,
      height,
      selected: false,
      options,
    };
  } else if (type === "ellipse") {
    return {
      id: nanoid(),
      type,
      x,
      y,
      width,
      height,
      selected: false,
      options,
    };
  } else if (type === "line") {
    return {
      id: nanoid(),
      type,
      x,
      y,
      width,
      height,
      x2: clientX,
      y2: clientY,
      selected: false,
      options,
    };
  }

  return undefined;
}

export default newElement;
