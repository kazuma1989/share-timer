<script lang="ts">
  import type { Observable } from "rxjs"
  import type { TimerState } from "./timerReducer"

  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }
</script>
