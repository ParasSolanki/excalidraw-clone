import type { Options } from "roughjs/bin/core";

export type ElementOptions = Pick<Options, "stroke" | "fill">;

interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  options?: ElementOptions;
}

interface RectangleElement extends BaseElement {
  type: "rectangle";
}

interface LineElement extends BaseElement {
  type: "line";
  x2: number;
  y2: number;
}

interface EllipseElement extends BaseElement {
  type: "ellipse";
}

export type Element = RectangleElement | EllipseElement | LineElement;
export type ElementType = Element["type"] | "selection";
