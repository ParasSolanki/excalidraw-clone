import { createSignal } from "solid-js";
import { ElementType } from "./types";

interface AppState {
  elementType: ElementType;
  cursorX: number | null;
  cursorY: number | null;
  scrollX: number | null;
  scrollY: number | null;
}

function createAppState() {
  const [appState, setAppState] = createSignal<AppState>({
    elementType: "selection",
    cursorX: 0,
    cursorY: 0,
    scrollX: 0,
    scrollY: 0,
  });

  function updateAppState(props: Partial<AppState>) {
    setAppState((prev) => ({ ...prev, ...props }));
  }

  return { appState, updateAppState };
}

export default createAppState;
