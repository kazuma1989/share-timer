<script lang="ts">
  import clsx from "clsx"
  import type { Observable } from "rxjs"
  import type { TimerState } from "./timerReducer"
  import { getId } from "./util/getId"
  import type { Room } from "./zod/roomZod"

  export let room$: Observable<Room>
  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }

  $: ({ id: roomId, name: roomName } = $room$ ?? {})

  const _id = getId()
  const id = (_: "timer" | "status") => _id + _
</script>

<div class={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
  <div class="pt-2 text-center">
    <h1 aria-label={`タイマーの名前: ${roomName}`}>{roomName}</h1>
  </div>

  <form class="contents">
    <p id={id("status")} role="status" class="sr-only" />

    <div id={id("timer")} class="grid place-items-center tabular-nums" />
  </form>
</div>
