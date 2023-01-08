<script lang="ts" context="module">
  import { map, merge, partition, type Observable } from "rxjs"
  import { useRoom } from "./useRoom.1"
  import { isRoom, type InvalidDoc, type Room } from "./zod/roomZod"

  function roomOrInvalid(_room$: Observable<Room | InvalidDoc>) {
    const [room$, _invalid$] = partition(_room$, isRoom)
    const invalid$ = merge(room$.pipe(map(() => null)), _invalid$)

    return [room$, invalid$] as const
  }
</script>

<script lang="ts">
  export let roomId: Room["id"]

  $: [room$, invalid$] = roomOrInvalid(useRoom(roomId))

  $: if ($invalid$) {
    const [, invalidRoomId] = $invalid$
    console.log("invalid", invalidRoomId)
  }
</script>

{#if $room$}
  <div class="mx-auto h-screen max-w-prose">
    <p>ROOM ({$room$.id})</p>
  </div>
{/if}
