import { Component, For } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { IconTypes } from "solid-icons";
import type { ElementType } from "../types";
import {
  FiMousePointer,
  FiMenu,
  FiSquare,
  FiCircle,
  FiMinus,
} from "solid-icons/fi";
import createAppState from "../app/app-state";

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
  const { appState, updateAppState } = createAppState();

  return (
    <header class="fixed top-3 left-0 z-50 mx-3 w-full">
      <button class="rounded border border-stone-300 bg-white p-2.5 hover:bg-stone-100 focus:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-stone-300">
        <FiMenu />
      </button>
      <nav class="absolute top-0 left-1/2 flex max-w-3xl -translate-x-1/2 space-x-1 rounded border border-stone-200 bg-white p-1.5 shadow-md">
        <For each={headerOptions}>
          {({ name, icon }) => (
            <button
              class="rounded p-2.5 focus:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              classList={{
                "bg-indigo-400 text-white hover:bg-indigo-500":
                  appState().elementType === name,
                "bg-white text-black hover:bg-stone-100":
                  appState().elementType !== name,
              }}
              onclick={() => updateAppState({ elementType: name })}
            >
              <Dynamic component={icon} color={"currentColor"} />
            </button>
          )}
        </For>
      </nav>
    </header>
  );
};

export default Header;
