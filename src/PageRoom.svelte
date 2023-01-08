<script lang="ts">
  import { useRoom } from "./useRoom.1"
  import type { Room } from "./zod/roomZod"

  export let roomId: Room["id"]

  $: room$ = useRoom(roomId)
  $: console.log($room$)
</script>

<div class="mx-auto h-screen max-w-prose">
  <p>ROOM ({roomId})</p>
</div>
