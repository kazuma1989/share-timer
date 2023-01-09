<script lang="ts">
  import clsx from "clsx"
  import Slider from "./Slider.svelte"
  import { parseDuration } from "./util/parseDuration"

  export let defaultValue: number

  let className: string = ""
  export { className as class }

  $: defaultDuration = parseDuration(defaultValue)
</script>

<span class={clsx("inline-flex gap-2", className)}>
  <Slider
    label="時間"
    defaultValue={defaultDuration.hours}
    valueMax={23}
    onChange={(value) => {
      // duration$.current.hours = value
    }}
  />

  <Slider
    label="分"
    defaultValue={defaultDuration.minutes}
    valueMax={59}
    onChange={(value) => {
      // duration$.current.minutes = value
    }}
  />

  <Slider
    label="秒"
    defaultValue={defaultDuration.seconds}
    valueMax={59}
    onChange={(value) => {
      // duration$.current.seconds = value
    }}
  />
</span>
