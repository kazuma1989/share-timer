<script lang="ts">
  import clsx from "clsx"
  import { map, Observable, withLatestFrom } from "rxjs"
  import { mapToCurrentDuration } from "./mapToCurrentDuration"
  import { notifyFirstZero } from "./notifyFirstZero"
  import { now } from "./now"
  import type { TimerState } from "./timerReducer"
  import { useConfig } from "./useConfig"
  import { interval } from "./util/interval"

  export let timerState$: Observable<TimerState>
  export { className as class }
  let className: string = ""

  const config$ = useConfig()

  $: flashing$ = timerState$.pipe(
    mapToCurrentDuration(interval("ui"), now),
    notifyFirstZero(),
    withLatestFrom(config$),
    map(([notified, config]) => config.flash === "on" && notified)
  )
</script>

<div
  class={clsx(
    "pointer-events-none absolute inset-0 text-cerise-500/75 dark:text-gray-100/75",
    $flashing$ && "animate-flash",
    className
  )}
/>
