<script lang="ts">
  import { firstValueFrom, map, merge, partition, type Observable } from "rxjs"
  import FlashCover from "./FlashCover.svelte"
  import { isRoom, type InvalidDoc, type Room } from "./schema/roomSchema"
  import { setSoundCall } from "./setSoundCall"
  import { setTitleAsTimeViewer } from "./setTitleAsTimeViewer"
  import Timer from "./Timer.svelte"
  import { useAudio } from "./useAudio"
  import { useConfig } from "./useConfig"
  import { useRoom } from "./useRoom"
  import { useSetup } from "./useSetup"
  import { useTimerState } from "./useTimerState"

  export let roomId: Room["id"]

  $: [room$, invalidRoomId$] = roomOrInvalid(useRoom(roomId))
  $: setup$ = $invalidRoomId$ && useSetup($invalidRoomId$)?.()
  $: timerState$ = useTimerState(roomId)

  let unsubscribeTitle: (() => void) | undefined
  $: {
    unsubscribeTitle?.()
    unsubscribeTitle = setTitleAsTimeViewer(timerState$)
  }

  const config$ = useConfig()
  const audio = useAudio()

  let unsubscribeSound: (() => void) | undefined
  $: {
    unsubscribeSound?.()
    unsubscribeSound = setSoundCall(
      timerState$,
      config$.pipe(map((_) => _.sound === "on")),
      () => {
        console.debug("audio.play()")
        audio.play()
      }
    )
  }

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
