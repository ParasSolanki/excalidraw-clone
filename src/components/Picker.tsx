import { createSignal, For, onCleanup, onMount, Show } from "solid-js";
import type { Component } from "solid-js";
import transparentImg from "@/assets/images/transparent.png";

const Box: Component<{
  name?: string;
  value: string;
  onClick: (
    e: MouseEvent & {
      currentTarget: HTMLButtonElement;
      target: Element;
    }
  ) => void;
}> = (props) => {
  return (
    <button
      type="button"
      class="h-7 w-7 rounded border border-slate-300"
      title={`${props.name ?? ""} (${props.value}) color`}
      style={{
        "background-color": props.value,
        "background-image":
          props.value === "transparent" ? `url(${transparentImg})` : "none",
      }}
      onClick={(e) => {
        props.onClick(e);
      }}
    >
      <span class="sr-only">{props.name ?? ""} color</span>
    </button>
  );
};

const Picker: Component<{
  name: string;
  value: string;
  variants: Array<{ name: string; value: string }>;
  onUpdate: (value: string) => void;
}> = (props) => {
  const [isOpenVariants, setIsOpenVariants] = createSignal(false);
  let divRef: HTMLDivElement | undefined;

  function handleChangeValue(value: string) {
    if (!value) return;

    if (value === "transparent") {
      props.onUpdate("transparent");
      return;
    }

    const isValidHexColor = /^#([0-9A-F]{3}){1,2}$/i.test(`#${value}`);

    if (isValidHexColor) {
      props.onUpdate(`#${value}`);
    }
  }

  function handleVarientsOpen(ev: PointerEvent) {
    // target is not descendant of divRef element and is open
    if (!divRef?.contains(ev.target) && isOpenVariants()) {
      setIsOpenVariants(false);
    }
  }

  onMount(() => {
    document.addEventListener("pointerdown", handleVarientsOpen);
  });

  onCleanup(() => {
    document.removeEventListener("pointerdown", handleVarientsOpen);
  });

  return (
    <div class="space-y-1">
      <label for={props.name} class="block text-xs text-slate-700">
        {props.name}
      </label>
      <div ref={divRef} class="relative flex items-center space-x-2">
        <div class="flex items-center justify-center">
          <Box
            value={props.value}
            onClick={() => setIsOpenVariants((open) => !open)}
          />

          <Show when={isOpenVariants()}>
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Color Picker"
              class="fixed top-0 -right-4 z-50 grid grid-cols-5 gap-2 rounded border border-slate-200 bg-white p-3 shadow-md"
            >
              <For each={props.variants}>
                {(variant) => (
                  <Box
                    name={variant.name}
                    value={variant.value}
                    onClick={() => {
                      handleChangeValue(variant.value.replace("#", ""));
                      setIsOpenVariants(false);
                    }}
                  />
                )}
              </For>
            </div>
          </Show>
        </div>
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
              handleChangeValue(currentTarget.value);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Picker;
