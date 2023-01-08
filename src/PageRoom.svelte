<script lang="ts">
  import type { Room } from "./zod/roomZod"

  export let roomId: Room["id"]
</script>

<div class="mx-auto h-screen max-w-prose">
  <p>ROOM ({roomId})</p>
</div>
