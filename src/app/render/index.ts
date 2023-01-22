import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Element } from "../../types";

interface RenderSceneProps {
  elements: Element[];
  roughCanvas: RoughCanvas | null;
  ctx: CanvasRenderingContext2D | null;
}

export function renderScene({ elements, roughCanvas, ctx }: RenderSceneProps) {
  if (!roughCanvas || !ctx) return;

  // clear previous elements
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  elements.forEach((el) => {
    if (el.type === "rectangle") {
      roughCanvas.rectangle(el.x, el.y, el.width, el.height);
    }
    if (el.type === "line") {
      roughCanvas.line(el.x, el.y, el.x2, el.y2);
    }
    if (el.type === "ellipse") {
      roughCanvas.ellipse(el.y, el.y, el.width, el.height);
    }
  });
}
