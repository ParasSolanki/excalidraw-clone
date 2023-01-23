interface BaseElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
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
