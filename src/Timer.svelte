<script lang="ts">
  import type { Observable } from "rxjs"
  import type { TimerState } from "./timerReducer"
  import type { Room } from "./zod/roomZod"

  export let room$: Observable<Room>
  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }
</script>

{#if $room$}
  <p>ROOM ({$room$.id})</p>
{/if}
