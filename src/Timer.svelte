<script lang="ts">
  import clsx from "clsx"
  import { map, type Observable } from "rxjs"
  import DurationSelect from "./DurationSelect.svelte"
  import Icon from "./Icon.svelte"
  import { now } from "./now"
  import { getItem } from "./storage"
  import type { TimerState } from "./timerReducer"
  import TimeViewer from "./TimeViewer.svelte"
  import { useDispatch } from "./useDispatch"
  import { getId } from "./util/getId"
  import { humanReadableLabelOf } from "./util/humanReadableLabelOf"
  import { ServerTimestamp } from "./util/ServerTimestamp"
  import type { Room } from "./zod/roomZod"

  export let room$: Observable<Room>
  export let timerState$: Observable<TimerState>

  let className: string = ""
  export { className as class }

  const _id = getId()
  const id = (_: "timer" | "status") => _id + _

  $: ({ id: roomId, name: roomName, lockedBy } = $room$ ?? {})
  $: locked = lockedBy && lockedBy !== getItem("userId")

  $: [pending, dispatch] = useDispatch(roomId)

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

  // TODO これでいいのか？
  let draftDuration: number
  $: draftDuration = draftDuration ?? $timerState$?.initialDuration
</script>

{#if $timerState$}
  {@const state = $timerState$}

  <div class={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
    <div class="pt-2 text-center">
      <h1 aria-label={`タイマーの名前: ${roomName}`}>
        {roomName}
      </h1>
    </div>

    <form
      class="contents"
      on:submit|preventDefault={() => {
        if (state.mode !== "editing") return

        dispatch({
          type: "start",
          withDuration: draftDuration,
          at: new ServerTimestamp(now()),
        })

        // TODO 意図したとおりの挙動になっていないかもしれない
        draftDuration = state.initialDuration
      }}
    >
      <p id={id("status")} role="status" class="sr-only">
        {$label$}
      </p>

      <div id={id("timer")} class="grid place-items-center tabular-nums">
        {#if !locked && state.mode === "editing"}
          <div
            class="grid aspect-video w-[512px] max-w-[100vw] touch-pinch-zoom place-items-center"
          >
            {#key state.mode + state.initialDuration}
              <DurationSelect bind:value={draftDuration} />
            {/key}

            <!-- TODO デバッグ用なので消す -->
            <p>{draftDuration}</p>
          </div>
        {:else}
          <TimeViewer {timerState$} />
        {/if}
      </div>

      {#if locked}
        <div class="flex items-center justify-around">
          <button
            aria-controls={`${id("status")} ${id("timer")}`}
            type="button"
            disabled
            class="circle-button circle-button-gray text-2xl"
          >
            <Icon name="lock-outline" />
          </button>

          <button
            aria-controls={`${id("status")} ${id("timer")}`}
            type="button"
            disabled
            class="circle-button circle-button-green text-2xl"
            class:!circle-button-orange={state.mode === "running"}
          >
            <Icon name="lock-outline" />
          </button>
        </div>
      {:else}
        <div class="flex items-center justify-around">
          <button
            aria-controls={`${id("status")} ${id("timer")}`}
            type="button"
            disabled={state.mode === "editing"}
            class="circle-button circle-button-gray text-xs"
            on:click={() => {
              dispatch({
                type: "cancel",
              })
            }}
          >
            キャンセル
          </button>

          {#if state.mode === "editing"}
            <button
              aria-controls={`${id("status")} ${id("timer")}`}
              type="submit"
              class="circle-button circle-button-green"
            >
              開始
            </button>
          {:else if state.mode === "running"}
            <button
              aria-controls={`${id("status")} ${id("timer")}`}
              type="button"
              class="circle-button circle-button-orange"
              on:click={() => {
                dispatch({
                  type: "pause",
                  at: new ServerTimestamp(now()),
                })
              }}
            >
              一時停止
            </button>
          {:else}
            <button
              aria-controls={`${id("status")} ${id("timer")}`}
              type="button"
              class="circle-button circle-button-green"
              on:click={() => {
                if (pending) return

                dispatch({
                  type: "resume",
                  at: new ServerTimestamp(now()),
                })
              }}
            >
              再開
            </button>
          {/if}
        </div>
      {/if}
    </form>
  </div>
{/if}
