import { Component, createEffect, createSignal, onMount, Show } from "solid-js";
import rough from "roughjs";
import type { RoughCanvas } from "roughjs/bin/canvas";
import type { Element } from "@/types";

import createAppState from "@/app/app-state";
import { createNewElement } from "@/app/elements";
import { renderScene } from "@/app/render";
import Header from "@/components/Header";
import transparentImg from "@/assets/images/transparent.png";

const [canvasData, setCanvasData] = createSignal<{
  roughCanvas: RoughCanvas | null;
  ctx: CanvasRenderingContext2D | null;
}>({ roughCanvas: null, ctx: null });
const [elements, setElements] = createSignal<Element[]>([]);
const { appState, updateAppState } = createAppState();

const Canvas: Component = () => {
  let canvasRef: HTMLCanvasElement | undefined = undefined;

  onMount(() => {
    if (!canvasRef) return;
    setCanvasData({
      roughCanvas: rough.canvas(canvasRef),
      ctx: canvasRef.getContext("2d"),
    });
  });

  createEffect(() => {
    renderScene({
      elements: elements(),
      ctx: canvasData()?.ctx,
      roughCanvas: canvasData()?.roughCanvas,
    });
  });

  function handleMouseDown(e: MouseEvent) {
    const ctx = canvasData()?.ctx;

    if (!ctx) return;

    updateAppState({
      cursorX: e.clientX,
      cursorY: e.clientY,
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
          options: {
            stroke: appState().stroke,
            fill: appState().background,
          },
        });

        if (el) {
          setElements((prev) => [...prev, el]);
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

        if (el) {
          setElements((prev) => [...prev, el]);
          updateAppState({ currentElement: el });
        }
      }
    }

    function handleMouseUp() {
      updateAppState({
        cursorX: null,
        cursorY: null,
        elementType: "selection",
        currentElement: null,
      });
      // clear selected elements
      setElements((prev) => prev.map((el) => ({ ...el, selected: false })));

      ctx?.canvas.removeEventListener("mousemove", handleMouseMove);
      ctx?.canvas.removeEventListener("mouseup", handleMouseUp);
    }

    ctx.canvas.addEventListener("mousemove", handleMouseMove);
    ctx.canvas.addEventListener("mouseup", handleMouseUp);
  }

  function handleWheel(e: WheelEvent) {
    e.preventDefault();
    const { deltaX, deltaY } = e;
    updateAppState({
      scrollX: scrollX - deltaX,
      scrollY: scrollY - deltaY,
    });
  }

  return (
    <canvas
      ref={canvasRef}
      class="relative"
      classList={{
        "cursor-crosshair": appState().elementType !== "selection",
        "cursor-default": appState().elementType === "selection",
      }}
      width={window.innerWidth}
      height={window.innerHeight}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    />
  );
};

const Picker: Component<{
  name: string;
  value: string;
  onUpdate: (value: string) => void;
}> = (props) => {
  return (
    <div class="space-y-1">
      <label for={props.name} class="block text-xs text-slate-700">
        {props.name}
      </label>
      <div class="flex items-center space-x-2">
        <div
          class="h-8 w-12 rounded border border-slate-300"
          style={{
            "background-color": props.value,
            "background-image":
              props.value === "transparent" ? `url(${transparentImg})` : "none",
          }}
        ></div>
        <div class="relative">
          <span class="pointer-events-none absolute flex h-full w-8 items-center justify-center">
            #
          </span>
          <input
            id={props.name}
            type="text"
            value={props.value.replace("#", "")}
            spellcheck={false}
            class="w-full rounded border border-slate-300 py-1.5 pr-2 pl-8 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-indigo-500"
            onInput={({ currentTarget }) => {
              if (!currentTarget.value) return;

              if (currentTarget.value === "transparent") {
                props.onUpdate("transparent");
                return;
              }

              const isValidHexColor = /^#([0-9A-F]{3}){1,2}$/i.test(
                `#${currentTarget.value}`
              );

              if (isValidHexColor) {
                props.onUpdate(`#${currentTarget.value}`);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

const Sidebar: Component = () => {
  return (
    <aside class="fixed top-1/2 left-0 z-50 ml-3 w-52 -translate-y-1/2 space-y-4 overflow-y-auto rounded border border-stone-200 bg-white p-4 shadow-md">
      {/* stroke */}
      <Picker
        name="Stroke"
        value={appState().stroke}
        onUpdate={(value) => updateAppState({ stroke: value })}
      />

      {/* Background */}
      <Picker
        name="Background"
        value={appState().background}
        onUpdate={(value) => updateAppState({ background: value })}
      />

      {/* opacity */}
      <div class="space-y-1">
        <label for="opacity" class="block text-xs text-slate-700">
          Opacity
        </label>
        <input
          id="opacity"
          type="range"
          class="w-full"
          min="0"
          max="1"
          step="0.01"
        />
      </div>
    </aside>
  );
};

const App: Component = () => {
  return (
    <>
      <Header />
      <Show when={appState().elementType !== "selection"}>
        <Sidebar />
      </Show>
      <Canvas />
    </>
  );
};

export default App;
