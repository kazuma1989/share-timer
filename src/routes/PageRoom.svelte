<script lang="ts">
  import { fromRoute } from "$lib/toRoute"
  import { useAudio } from "$lib/useAudio"
  import { firstValueFrom, map, merge, partition, type Observable } from "rxjs"
  import { isRoom, type InvalidDoc, type Room } from "../schema/roomSchema"
  import { setSoundCall } from "../setSoundCall"
  import { setTitleAsTimeViewer } from "../setTitleAsTimeViewer"
  import { useRoom } from "../useRoom"
  import { useSetup } from "../useSetup"
  import { useTimerState } from "../useTimerState"
  import ConfigArea from "./ConfigArea.svelte"
  import FlashCover from "./FlashCover.svelte"
  import Timer from "./Timer.svelte"
  import { useConfig } from "./useConfig"

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
    <Timer {room$} {timerState$} class="h-full">
      <div slot="header" class="pt-2 text-center">
        <h1 aria-label="タイマーの名前: {$room$.name}">
          {$room$.name}
        </h1>
      </div>

      <ConfigArea
        infoHash="#{fromRoute(['room', roomId])}"
        class="flex items-center justify-evenly px-6"
      />
    </Timer>

    <FlashCover {timerState$} />
  </div>
{/await}
