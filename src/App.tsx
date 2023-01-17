import { Component, createSignal, onMount } from "solid-js";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { RoughGenerator } from "roughjs/bin/generator";
import type { Element, SelectedType } from "./types";
import {
  FiMousePointer,
  FiMenu,
  FiSquare,
  FiCircle,
  FiMinus,
} from "solid-icons/fi";

const [canvasData, setCanvasData] = createSignal<{
  roughCanvas: RoughCanvas;
  canvasContext: CanvasRenderingContext2D | null;
  generator: RoughGenerator;
}>();
const [elements, setElements] = createSignal<Element[]>();
const [selectedType, setSelectedType] = createSignal<SelectedType>("selction");

interface CreateElementProps {
  type: Element["type"];
  id: number;
  x: number;
  y: number;
  clientX: number;
  clientY: number;
}

function createElement({
  type,
  x,
  y,
  clientX,
  clientY,
  id,
}: CreateElementProps): Element | undefined {
  const diffX = clientX - x;
  const diffY = clientY - y;

  if (type === "rectangle") {
    return { type, x, y, id, width: diffX, height: diffY };
  }
  if (type === "line") {
    return { type, id, x, y, x2: clientX, y2: clientY };
  }
  if (type === "circle") {
    const dia = Math.sqrt(diffX * 2 + diffY * 2);
    return { type, x, y, id, diameter: dia };
  }

  return undefined;
}

function drawElements() {
  const elementsData = elements();
  const canvas = canvasData();

  if (!elementsData || !canvas) return;

  if (canvas.canvasContext) {
    // clear previous elements
    canvas.canvasContext.clearRect(
      0,
      0,
      canvas.canvasContext.canvas.width,
      canvas.canvasContext.canvas.height
    );
  }
  elementsData.forEach((el) => {
    let obj;
    if (el.type === "rectangle") {
      obj = canvas.generator.rectangle(el.x, el.y, el.width, el.height);
    }
    if (el.type === "line") {
      obj = canvas.generator.line(el.x, el.y, el.x2, el.y2);
    }
    if (el.type === "circle") {
      obj = canvas.generator.circle(el.x, el.y, el.diameter);
    }

    if (obj) canvas.roughCanvas.draw(obj);
  });
}

const Canvas: Component = () => {
  const [isMouseDown, setIsMouseDown] = createSignal(false);
  const [currentElement, setCurrentElement] = createSignal<Element>();
  const [cords, setCords] = createSignal<{ x: number; y: number }>();
  let canvasRef: HTMLCanvasElement | undefined = undefined;

  onMount(() => {
    if (!canvasRef) return;
    const roughCanvas = rough.canvas(canvasRef);
    const canvasContext = canvasRef.getContext("2d");

    setCanvasData(() => ({
      roughCanvas,
      canvasContext,
      generator: roughCanvas.generator,
    }));
  });

  function handleMouseDown(
    e: MouseEvent & {
      currentTarget: HTMLCanvasElement;
      target: globalThis.Element;
    }
  ) {
    setCords(() => ({ x: e.clientX, y: e.clientY }));
    setIsMouseDown(true);
  }

  function handleMouseMove(
    e: MouseEvent & {
      currentTarget: HTMLCanvasElement;
      target: globalThis.Element;
    }
  ) {
    // if mouse not down then return
    const cordsPos = cords();
    const type = selectedType();
    if (!isMouseDown() || !cordsPos || !type) return;
    if (type === "selction") return;

    const currentElementData = currentElement();

    if (!currentElementData) {
      const el = createElement({
        type,
        x: cordsPos.x,
        y: cordsPos.y,
        id: Math.floor(Math.random() * 1000),
        clientX: e.clientX,
        clientY: e.clientY,
      });

      if (el) {
        setCurrentElement(el);
        setElements((prevElements) => {
          if (!prevElements) return [el];
          return [...prevElements, el];
        });
      }
    } else {
      const els = elements()?.map((el) => {
        if (el.id === currentElement()?.id) {
          const obj = createElement({
            type: el.type,
            x: el.x,
            y: el.y,
            id: el.id,
            clientX: e.clientX,
            clientY: e.clientY,
          });

          if (obj) return obj;
        }

        return { ...el };
      });

      if (els) setElements(els);
    }

    drawElements();
  }

  function handleMouseUp(
    e: MouseEvent & {
      currentTarget: HTMLCanvasElement;
      target: globalThis.Element;
    }
  ) {
    setIsMouseDown(false);
    setCords(undefined);
    setCurrentElement(undefined);
    setSelectedType(() => "selction");
  }

  return (
    <canvas
      ref={canvasRef}
      classList={{
        "cursor-crosshair": selectedType() !== "selction",
        "cursor-default": selectedType() === "selction",
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      onmousedown={handleMouseDown}
      onmousemove={handleMouseMove}
      onmouseup={handleMouseUp}
    ></canvas>
  );
};

const Header: Component = () => {
  return (
    <header class="fixed top-3 left-0 w-full px-2">
      <button class="rounded border border-stone-300 bg-white p-2.5  hover:bg-stone-100">
        <FiMenu />
      </button>
      <nav class="absolute top-0 left-1/2 flex max-w-3xl -translate-x-1/2 space-x-1 rounded border border-stone-200 p-1.5 shadow-md">
        <button
          class="rounded  p-2.5 hover:bg-stone-100 focus:bg-indigo-400"
          classList={{
            "bg-indigo-400": selectedType() === "selction",
            "bg-white": selectedType() !== "selction",
          }}
          onclick={() => setSelectedType(() => "selction")}
        >
          <FiMousePointer
            color={selectedType() === "selction" ? "white" : "black"}
          />
        </button>
        <button
          class="rounded bg-white p-2.5 hover:bg-stone-100 focus:bg-indigo-400"
          classList={{
            "bg-indigo-400": selectedType() === "rectangle",
            "bg-white": selectedType() !== "rectangle",
          }}
          onClick={() => setSelectedType(() => "rectangle")}
        >
          <FiSquare
            color={selectedType() === "rectangle" ? "white" : "black"}
          />
        </button>
        <button
          class="rounded bg-white p-2.5 hover:bg-stone-100 focus:bg-indigo-400"
          classList={{
            "bg-indigo-400": selectedType() === "circle",
            "bg-white": selectedType() !== "circle",
          }}
          onClick={() => setSelectedType(() => "circle")}
        >
          <FiCircle color={selectedType() === "circle" ? "white" : "black"} />
        </button>
        <button
          class="rounded bg-white p-2.5 hover:bg-stone-100 focus:bg-indigo-400"
          classList={{
            "bg-indigo-400": selectedType() === "line",
            "bg-white": selectedType() !== "line",
          }}
          onClick={() => setSelectedType(() => "line")}
        >
          <FiMinus color={selectedType() === "line" ? "white" : "black"} />
        </button>
      </nav>
    </header>
  );
};

const App: Component = () => {
  return (
    <>
      <Header />
      <Canvas />
    </>
  );
};

export default App;
