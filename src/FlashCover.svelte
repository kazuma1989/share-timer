<script lang="ts">
  import type { Observable } from "rxjs"
  import type { TimerState } from "./timerReducer"

  export let timerState$: Observable<TimerState>
</script>

<!-- TODO 本物の実装 -->
