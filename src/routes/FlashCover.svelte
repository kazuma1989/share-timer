<script lang="ts">
  import { interval } from "$lib/util/interval"
  import clsx from "clsx"
  import { map, Observable, withLatestFrom } from "rxjs"
  import { mapToCurrentDuration } from "../mapToCurrentDuration"
  import { notifyFirstZero } from "../notifyFirstZero"
  import type { TimerState } from "../schema/timerReducer"
  import { useConfig } from "./useConfig"

  export let timerState$: Observable<TimerState>
  export { className as class }
  let className: string = ""

  const config$ = useConfig()

  $: flashing$ = timerState$.pipe(
    mapToCurrentDuration(interval("ui").pipe(map(Date.now))),
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
