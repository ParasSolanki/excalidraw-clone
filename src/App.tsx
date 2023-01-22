import { Component, createSignal, For, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";
import rough from "roughjs";
import { nanoid } from "nanoid";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Element, ElementType } from "./types";
import {
  FiMousePointer,
  FiMenu,
  FiSquare,
  FiCircle,
  FiMinus,
} from "solid-icons/fi";
import type { IconTypes } from "solid-icons";
import createAppState from "./app-state";

const [canvasData, setCanvasData] = createSignal<{
  roughCanvas: RoughCanvas;
  canvasContext: CanvasRenderingContext2D | null;
}>();
const [elements, setElements] = createSignal<Element[]>([]);
const { appState, updateAppState } = createAppState();

interface CreateNewElementProps {
  type: Element["type"];
  x: number;
  y: number;
  clientX: number;
  clientY: number;
}

function createNewElement({
  type,
  x,
  y,
  clientX,
  clientY,
}: CreateNewElementProps): Element | undefined {
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
      canvas.roughCanvas.ellipse(el.y, el.y, el.width, el.height);
    }
  });
}

const Canvas: Component = () => {
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
    const ctx = canvasData()?.canvasContext;

    if (!ctx) return;

    const offsetLeft = ctx.canvas.offsetLeft ?? 0;
    const offsetTop = ctx.canvas.offsetTop ?? 0;
    updateAppState({
      cursorX: e.clientX - offsetLeft,
      cursorY: e.clientY - offsetTop,
    });

    function handleMouseMove(e: MouseEvent) {
      const appStateData = appState();
      if (
        appStateData.elementType === "selection" ||
        appStateData.cursorX === null ||
        appStateData.cursorY === null
      ) {
        return;
      }

      if (appStateData.currentElement === null) {
        const el = createNewElement({
          type: appStateData.elementType,
          x: appStateData.cursorX,
          y: appStateData.cursorY,
          clientX: e.clientX,
          clientY: e.clientY,
        });

        if (el) {
          setElements((prevElements) => [...prevElements, el]);
          updateAppState({ currentElement: el });
        }
      } else {
        const el = appStateData.currentElement;
        el.width = e.clientX - el.x;
        el.height = e.clientY - el.y;

        if (el.type === "line") {
          el.x2 = e.clientX;
          el.y2 = e.clientY;
        }
      }

      drawElements();
    }

    function handleMouseUp() {
      updateAppState({
        cursorX: null,
        cursorY: null,
        elementType: "selection",
        currentElement: null,
      });

      ctx?.canvas.removeEventListener("mousemove", handleMouseMove);
      ctx?.canvas.removeEventListener("mouseup", handleMouseUp);
    }

    ctx.canvas.addEventListener("mousemove", handleMouseMove);
    ctx.canvas.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <canvas
      ref={canvasRef}
      classList={{
        "cursor-crosshair": appState().elementType !== "selection",
        "cursor-default": appState().elementType === "selection",
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      onmousedown={handleMouseDown}
    ></canvas>
  );
};

const headerOptions = [
  {
    name: "selection",
    icon: FiMousePointer,
  },
  {
    name: "rectangle",
    icon: FiSquare,
  },
  {
    name: "ellipse",
    icon: FiCircle,
  },
  {
    name: "line",
    icon: FiMinus,
  },
] satisfies {
  name: ElementType;
  icon: IconTypes;
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
                "bg-indigo-400": appState().elementType === name,
                "bg-white": appState().elementType !== name,
              }}
              onclick={() => updateAppState({ elementType: name })}
            >
              <Dynamic
                component={icon}
                color={appState().elementType === name ? "white" : "black"}
              />
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
