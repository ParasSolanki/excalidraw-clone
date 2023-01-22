import { nanoid } from "nanoid";
import type { Element } from "../../types";

interface NewElementProps {
  type: Element["type"];
  x: number;
  y: number;
  clientX: number;
  clientY: number;
}

function newElement({ type, x, y, clientX, clientY }: NewElementProps) {
  const width = clientX - x;
  const height = clientY - y;

  if (type === "rectangle") {
    return { id: nanoid(), type, x, y, width, height };
  } else if (type === "ellipse") {
    return { id: nanoid(), type, x, y, width, height };
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
    };
  }

  return undefined;
}

export default newElement;
