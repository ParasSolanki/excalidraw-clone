import { Component, createSignal, For, JSX, onMount } from "solid-js";
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
}>();
const [elements, setElements] = createSignal<Element[]>();
const [selectedType, setSelectedType] = createSignal<SelectedType>("selection");

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
  if (type === "ellipse") {
    return { type, x, y, id, width: diffX, height: diffY };
  }

  return undefined;
}

function drawElements() {
  const elementsData = elements();
  const canvas = canvasData();

  if (!elementsData || !canvas) return;

  // clear previous elements
  canvas.canvasContext?.clearRect(
    0,
    0,
    canvas.canvasContext.canvas.width,
    canvas.canvasContext.canvas.height
  );

  elementsData.forEach((el) => {
    if (el.type === "rectangle") {
      canvas.roughCanvas.rectangle(el.x, el.y, el.width, el.height);
    }
    if (el.type === "line") {
      canvas.roughCanvas.line(el.x, el.y, el.x2, el.y2);
    }
    if (el.type === "ellipse") {
      // console.log(canvas.canvasContext?.moveTo())
      canvas.roughCanvas.ellipse(
        el.width / 2,
        el.height / 2,
        el.width,
        el.height
      );
    }
  });
}

const Canvas: Component = () => {
  const [isMouseDown, setIsMouseDown] = createSignal(false);
  const [currentElement, setCurrentElement] = createSignal<Element>();
  const [cords, setCords] = createSignal<{ x: number; y: number }>();
  let canvasRef: HTMLCanvasElement | undefined = undefined;

  onMount(() => {
    if (!canvasRef) return;
    const roughCanvas = rough.canvas(canvasRef, { options: {} });
    const canvasContext = canvasRef.getContext("2d");

    setCanvasData(() => ({
      roughCanvas,
      canvasContext,
    }));
  });

  function handleMouseDown(
    e: MouseEvent & {
      currentTarget: HTMLCanvasElement;
      target: globalThis.Element;
    }
  ) {
    const offsetLeft = canvasData()?.canvasContext?.canvas.offsetLeft ?? 0;
    const offsetTop = canvasData()?.canvasContext?.canvas.offsetTop ?? 0;
    setCords(() => ({ x: e.clientX - offsetLeft, y: e.clientY - offsetTop }));
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
    if (type === "selection") return;

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
    setSelectedType(() => "selection");
  }

  return (
    <canvas
      ref={canvasRef}
      classList={{
        "cursor-crosshair": selectedType() !== "selection",
        "cursor-default": selectedType() === "selection",
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      onmousedown={handleMouseDown}
      onmousemove={handleMouseMove}
      onmouseup={handleMouseUp}
    ></canvas>
  );
};

const headerOptions = [
  {
    name: "selection",
    icon: <FiMousePointer />,
  },
  {
    name: "rectangle",
    icon: <FiSquare />,
  },
  {
    name: "ellipse",
    icon: <FiCircle />,
  },
  {
    name: "line",
    icon: <FiMinus />,
  },
] satisfies {
  name: SelectedType;
  icon: JSX.Element;
}[];

const Header: Component = () => {
  return (
    <header class="fixed top-3 left-0 w-full px-2">
      <button class="rounded border border-stone-300 bg-white p-2.5 hover:bg-stone-100 focus:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-stone-300">
        <FiMenu />
      </button>
      <nav class="absolute top-0 left-1/2 flex max-w-3xl -translate-x-1/2 space-x-1 rounded border border-stone-200 bg-white p-1.5 shadow-md">
        <For each={headerOptions}>
          {({ name, icon }) => (
            <button
              class="rounded p-2.5 hover:bg-stone-100 focus:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              classList={{
                "bg-indigo-400": selectedType() === name,
                "bg-white": selectedType() !== name,
              }}
              onclick={() => setSelectedType(() => name)}
            >
              {icon}
            </button>
          )}
        </For>
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
