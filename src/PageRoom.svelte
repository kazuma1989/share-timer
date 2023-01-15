<script lang="ts">
  import {
    filter,
    firstValueFrom,
    map,
    merge,
    partition,
    withLatestFrom,
    type Observable,
  } from "rxjs"
  import { onMount } from "svelte"
  import FlashCover from "./FlashCover.svelte"
  import { mapToCurrentDuration } from "./mapToCurrentDuration"
  import { notifyFirstZero } from "./notifyFirstZero"
  import { now } from "./now"
  import { isRoom, type InvalidDoc, type Room } from "./schema/roomSchema"
  import { setTitleAsTimeViewer } from "./setTitleAsTimeViewer"
  import Timer from "./Timer.svelte"
  import { useAudio } from "./useAudio"
  import { useConfig } from "./useConfig"
  import { useRoom } from "./useRoom"
  import { useSetup } from "./useSetup"
  import { useTimerState } from "./useTimerState"
  import { interval } from "./util/interval"

  export let roomId: Room["id"]

  $: [room$, invalidRoomId$] = roomOrInvalid(useRoom(roomId))
  $: setup$ = $invalidRoomId$ && useSetup($invalidRoomId$)?.()
  $: timerState$ = useTimerState(roomId)

  onMount(() => setTitleAsTimeViewer(timerState$))

  const config$ = useConfig()
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

  function roomOrInvalid(_room$: Observable<Room | InvalidDoc>) {
    const [room$, _invalid$] = partition(_room$, isRoom)

    const clearWhenValid$ = room$.pipe(map(() => null))
    const invalidRoomId$ = merge(
      clearWhenValid$,
      _invalid$.pipe(map(([, roomId]) => roomId))
    )

    return [room$, invalidRoomId$] as const
  }
</script>

{#await Promise.all( [setup$, firstValueFrom(room$), firstValueFrom(timerState$)] ) then}
  <div class="mx-auto h-screen max-w-prose">
    <Timer {room$} {timerState$} class="h-full" />

    <FlashCover {timerState$} />
  </div>
{/await}
