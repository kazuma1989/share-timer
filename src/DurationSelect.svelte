<script lang="ts">
  import clsx from "clsx"
  import Slider from "./Slider.svelte"
  import { parseDuration } from "./util/parseDuration"

  export let value: number

  let className: string = ""
  export { className as class }

  const duration = parseDuration(value)
  let draftHours = duration.hours
  let draftMinutes = duration.minutes
  let draftSeconds = duration.seconds

  $: value =
    draftHours * 3600_000 + draftMinutes * 60_000 + draftSeconds * 1_000
</script>

<span class={clsx("inline-flex gap-2", className)}>
  <Slider label="時間" bind:value={draftHours} valueMax={23} />

  <Slider label="分" bind:value={draftMinutes} valueMax={59} />

  <Slider label="秒" bind:value={draftSeconds} valueMax={59} />
</span>
