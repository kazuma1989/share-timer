<script lang="ts">
  import clsx from "clsx"
  import Slider from "./Slider.svelte"
  import { parseDuration } from "./util/parseDuration"

  export let value: number
  export { className as class }
  let className: string = ""

  let slider: Slider
  export const focus = () => {
    slider.focus()
  }

  const initialValue = value
  let { hours, minutes, seconds } = parseDuration(initialValue)

  $: value = hours * 3600_000 + minutes * 60_000 + seconds * 1_000
</script>

<span class={clsx("inline-flex gap-2", className)}>
  <Slider label="時間" bind:value={hours} valueMax={23} bind:this={slider} />

  <Slider label="分" bind:value={minutes} valueMax={59} />

  <Slider label="秒" bind:value={seconds} valueMax={59} />
</span>
