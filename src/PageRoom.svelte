<script lang="ts">
  import { firstValueFrom, map, merge, partition, type Observable } from "rxjs"
  import FlashCover from "./FlashCover.svelte"
  import { isRoom, type InvalidDoc, type Room } from "./schema/roomSchema"
  import Timer from "./Timer.svelte"
  import { useRoom } from "./useRoom"
  import { useSetup } from "./useSetup"
  import { useTimerState } from "./useTimerState"

  export let roomId: Room["id"]

  $: [room$, invalidRoomId$] = roomOrInvalid(useRoom(roomId))
  $: setup$ = $invalidRoomId$ && useSetup($invalidRoomId$)?.()
  $: timerState$ = useTimerState(roomId)

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
