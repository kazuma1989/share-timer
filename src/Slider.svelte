<script lang="ts">
  import clsx from "clsx"
  import type { Action } from "svelte/types/runtime/action"

  export let label: string = ""
  export let value: number = 0
  export let valueMax: number = 0

  let className: string = ""
  export { className as class }

  const observe: Action<HTMLElement> = (root) => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [target] = entries
          .filter(
            (
              _
            ): _ is Omit<IntersectionObserverEntry, "target"> & {
              target: HTMLElement
            } => _.isIntersecting && _.target instanceof HTMLElement
          )
          .map((_) => _.target)

        if (target) {
          root.dispatchEvent(
            new CustomEvent("intersect", {
              detail: target,
            })
          )
        }
      },
      {
        threshold: 1,
        rootMargin: "-32px 0px",
        root,
      }
    )

    Array.from(root.children).forEach((child) => {
      observer.observe(child)
    })

    return {
      destroy() {
        observer.disconnect()
      },
    }
  }
</script>

<span
  role="slider"
  aria-label={`${label}選択`}
  aria-orientation="vertical"
  aria-valuemin={0}
  aria-valuemax={valueMax}
  aria-valuenow={value}
  aria-valuetext={value === undefined ? undefined : `${value}${label}`}
  tabindex="0"
  class={className}
  on:keydown={(e) => {
    import.meta.env.DEV && console.debug(e.key, e.keyCode)

    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight": {
        e.preventDefault()

        // increment
        value += 1
        // const next = currentOption$.current?.nextElementSibling
        // next?.scrollIntoView({ block: "center" })
        break
      }

      case "ArrowDown":
      case "ArrowLeft": {
        e.preventDefault()

        // decrement
        value -= 1
        // const prev = currentOption$.current?.previousElementSibling
        // prev?.scrollIntoView({ block: "center" })
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
    use:observe
    on:intersect={(e) => {
      if (!(e.detail instanceof HTMLElement)) return

      value = Number(e.detail.dataset.value)
    }}
  >
    {#each Array(valueMax + 1) as _, index (index)}
      <span
        data-value={index}
        class={clsx("text-right", index !== value && "font-thin opacity-25")}
      >
        {index.toString(10).padStart(2, "0")}
      </span>
    {/each}
  </span>

  <span class="pointer-events-none inline-block w-12 pr-2 text-right text-lg">
    {label}
  </span>
</span>
