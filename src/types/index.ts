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

interface CircleElement extends BaseElement {
  type: "circle";
  diameter: number;
}

export type Element = RectangleElement | CircleElement | LineElement;
export type SelectedType = Element["type"] | "selction";
