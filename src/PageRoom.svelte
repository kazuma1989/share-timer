<script lang="ts">
  import { map, merge, partition, type Observable } from "rxjs"
  import { useRoom } from "./useRoom"
  import { useSetup } from "./useSetup"
  import { isRoom, type InvalidDoc, type Room } from "./zod/roomZod"

  function roomOrInvalid(_room$: Observable<Room | InvalidDoc>) {
    const [room$, _invalid$] = partition(_room$, isRoom)
    const invalid$ = merge(room$.pipe(map(() => null)), _invalid$)

    return [room$, invalid$] as const
  }

  function getSetup(invalid: InvalidDoc) {
    const [, invalidRoomId] = invalid
    return useSetup(invalidRoomId)
  }

  export let roomId: Room["id"]

  $: [room$, invalid$] = roomOrInvalid(useRoom(roomId))
  $: setup = $invalid$ && getSetup($invalid$)
</script>

{#await setup?.() then}
  {#if $room$}
    <div class="mx-auto h-screen max-w-prose">
      <p>ROOM ({$room$.id})</p>
    </div>
  {/if}
{/await}
