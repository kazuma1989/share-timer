<script lang="ts">
  import clsx from "clsx"
  import { intersect } from "./action/intersect"
  import { scrollIntoViewOnceIf } from "./action/scrollIntoViewOnceIf"

  export let label: string = ""
  export let value: number = 0
  export let valueMax: number = 0
  export { className as class }
  let className: string = ""

  let currentOption: HTMLElement

  const initialValue = value
</script>

<span
  role="slider"
  aria-label="{label}を選択"
  aria-orientation="vertical"
  aria-valuemin={0}
  aria-valuemax={valueMax}
  aria-valuenow={value}
  aria-valuetext="{value}{label}"
  tabindex="0"
  class={className}
  on:keydown={(e) => {
    import.meta.env.DEV && console.debug(e.key, e.keyCode)

    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight": {
        e.preventDefault()

        // increment
        const next = currentOption.nextElementSibling
        next?.scrollIntoView({ block: "center" })
        break
      }

      case "ArrowDown":
      case "ArrowLeft": {
        e.preventDefault()

        // decrement
        const prev = currentOption.previousElementSibling
        prev?.scrollIntoView({ block: "center" })
        break
      }
    }
  }}
>
  <span
    class={clsx(
      "scrollbar-hidden inline-flex snap-y snap-mandatory flex-col overflow-y-scroll overscroll-contain [&>*]:snap-center",
      "h-[calc(36px+6rem)] px-4 [&>:first-child]:mt-12 [&>:last-child]:mb-12",
      "cursor-pointer select-none rounded-md transition-colors",
      "hover:bg-dark/10 dark:hover:bg-light/20",
      "-mr-12 pr-14 text-3xl"
    )}
    use:intersect
    on:intersect={({ detail: step }) => {
      currentOption = step
      value = Number(step.dataset.value)
    }}
  >
    {#each Array(valueMax + 1) as _, index (index)}
      <span
        data-value={index}
        class={clsx("text-right", index !== value && "font-thin opacity-25")}
        use:scrollIntoViewOnceIf={index === initialValue}
      >
        {index.toString(10).padStart(2, "0")}
      </span>
    {/each}
  </span><span
    class="pointer-events-none inline-block w-12 pr-2 text-right text-lg"
  >
    {label}
  </span>
</span>
