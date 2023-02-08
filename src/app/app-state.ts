import { createSignal } from "solid-js";
import { ElementType, Element } from "@/types";

interface AppState {
  elementType: ElementType;
  cursorX: number | null;
  cursorY: number | null;
  scrollX: number | null;
  scrollY: number | null;
  currentElement: Element | null;
  stroke: string;
  background: string;
}

const [appState, setAppState] = createSignal<AppState>({
  elementType: "selection",
  cursorX: 0,
  cursorY: 0,
  scrollX: 0,
  scrollY: 0,
  currentElement: null,
  stroke: "#000000",
  background: "transparent",
});

function updateAppState(props: Partial<AppState>) {
  setAppState((prev) => ({ ...prev, ...props }));
}

function createAppState() {
  return { appState, updateAppState };
}

export default createAppState;
