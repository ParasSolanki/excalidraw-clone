import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Element } from "@/types";

interface RenderSceneProps {
  elements: Element[];
  roughCanvas: RoughCanvas | null;
  ctx: CanvasRenderingContext2D | null;
}

export function renderScene({ elements, roughCanvas, ctx }: RenderSceneProps) {
  if (!roughCanvas || !ctx) return;

  const fillStyle = ctx.fillStyle;

  // clear previous elements
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = fillStyle;

  elements.forEach((el) => {
    if (el.type === "rectangle") {
      roughCanvas.rectangle(el.x, el.y, el.width, el.height);
    }
    if (el.type === "line") {
      roughCanvas.line(el.x, el.y, el.x2, el.y2);
    }
    if (el.type === "ellipse") {
      roughCanvas.ellipse(el.x, el.y, el.width, el.height);
    }
  });
}
