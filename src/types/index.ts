interface BaseElement {
  id: number;
  x: number;
  y: number;
}

interface RectangleElement extends BaseElement {
  type: "rectangle";
  width: number;
  height: number;
}

interface LineElement extends BaseElement {
  type: "line";
  x2: number;
  y2: number;
}

interface EllipseElement extends BaseElement {
  type: "ellipse";
  width: number;
  height: number;
}

export type Element = RectangleElement | EllipseElement | LineElement;
export type SelectedType = Element["type"] | "selection";
