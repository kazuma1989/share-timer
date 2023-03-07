<script lang="ts">
  import clsx from "clsx"

  export { className as class }
  let className: string = ""
</script>

<div
  class={clsx(
    "pointer-events-none mx-auto h-screen max-w-prose select-none",
    className
  )}
>
  <div
    class="grid grid-rows-[auto_5fr_auto_4fr] h-full text-dark/20 dark:text-white/30 animate-pulse"
  >
    <div class="pt-2 text-center">
      <span class="inline-block w-4 h-2 rounded bg-current" />
      <span class="inline-block w-24 h-2 rounded bg-current" />
    </div>

    <div
      class="grid place-items-center tabular-nums -mt-3"
      style="font-size: min(100vw, 512px)"
    >
      <!-- TimerView の video 要素（横幅 512px ただし 100vw 以下）に 128px (= 512 * 25%) でテキストを描画するのを再現 -->
      <span
        style="font: 100 25%/1 system-ui, sans-serif; font-variant-numeric: inherit;"
      >
        00:00
      </span>
    </div>

    <div class="flex items-center justify-around">
      <span
        class="inline-block h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800"
      />
      <span
        class="inline-block h-20 w-20 rounded-full bg-green-100 dark:bg-green-800"
      />
    </div>
  </div>
</div>
