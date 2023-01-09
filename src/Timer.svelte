<script lang="ts">
  import clsx from "clsx"
  import { map, type Observable } from "rxjs"
  import { now } from "./now"
  import type { TimerState } from "./timerReducer"
  import { getId } from "./util/getId"
  import { humanReadableLabelOf } from "./util/humanReadableLabelOf"
  import type { Room } from "./zod/roomZod"

  export let room$: Observable<Room>
  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }

  $: ({ id: roomId, name: roomName } = $room$ ?? {})

  $: label$ = timerState$.pipe(
    map((state) => {
      switch (state.mode) {
        case "editing": {
          return `タイマーは編集中です。値は${humanReadableLabelOf(
            state.initialDuration
          )}`
        }

        case "running": {
          return `タイマーは実行中です。残り${humanReadableLabelOf(
            state.restDuration - (now() - state.startedAt)
          )}`
        }

        case "paused": {
          return `タイマーは一時停止中です。残り${humanReadableLabelOf(
            state.restDuration
          )}`
        }
      }
    })
  )

  const _id = getId()
  const id = (_: "timer" | "status") => _id + _
</script>

<div class={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
  <div class="pt-2 text-center">
    <h1 aria-label={`タイマーの名前: ${roomName}`}>{roomName}</h1>
  </div>

  <form
    class="contents"
    on:submit|preventDefault={() => {
      // TODO 本物の実装
      alert("not implemented!")
    }}
  >
    <p id={id("status")} role="status" class="sr-only">{$label$}</p>

    <div id={id("timer")} class="grid place-items-center tabular-nums" />
  </form>
</div>
