<script lang="ts">
  import clsx from "clsx"
  import { filter, map, Observable, withLatestFrom } from "rxjs"
  import { onMount } from "svelte"
  import { mapToCurrentDuration } from "./mapToCurrentDuration"
  import { notifyFirstZero } from "./notifyFirstZero"
  import { now } from "./now"
  import type { TimerState } from "./timerReducer"
  import { useAudio } from "./useAudio"
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
    map(([_, config]) => config.flash === "on" && _)
  )

  $: sounding$ = timerState$.pipe(
    mapToCurrentDuration(interval("worker", 100), now),
    notifyFirstZero(),
    withLatestFrom(config$),
    map(([_, config]) => config.sound === "on" && _)
  )

  const audio = useAudio()

  onMount(() => {
    const sub = sounding$.pipe(filter((_) => _ === true)).subscribe(() => {
      console.debug("audio.play()")
      audio.play()
    })

    return () => {
      sub.unsubscribe()
    }
  })
</script>

<div
  class={clsx(
    "pointer-events-none absolute inset-0 text-cerise-500/75 dark:text-gray-100/75",
    $flashing$ && "animate-flash",
    className
  )}
/>
