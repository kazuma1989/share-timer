<script lang="ts">
  import DurationSelect from "$lib/DurationSelect.svelte"
  import Icon from "$lib/Icon.svelte"
  import type { Room } from "$lib/schema/roomSchema"
  import type { TimerState } from "$lib/schema/timerReducer"
  import { serverTimestamp } from "$lib/Timestamp"
  import TimeViewer from "$lib/TimeViewer.svelte"
  import { useDispatch } from "$lib/useDispatch"
  import { getId } from "$lib/util/getId"
  import { humanReadableLabelOf } from "$lib/util/humanReadableLabelOf"
  import clsx from "clsx"
  import { distinctUntilChanged, map, type Observable } from "rxjs"
  import type { HTMLButtonAttributes } from "svelte/elements"

  export let room$: Observable<Room>
  export let timerState$: Observable<TimerState>
  export { className as class }
  let className: string = ""

  const _id = getId()
  const id = (_: "timer" | "status") => _id + _

  $: state = $timerState$
  $: ({ id: roomId } = $room$)

  $: initialDuration$ = timerState$.pipe(
    map((_) => _.initialDuration),
    distinctUntilChanged()
  )
  $: duration = $initialDuration$

  const locked = false
  $: [pending, dispatch] = useDispatch(roomId)

  let button: {
    label: string
    onClick?: HTMLButtonAttributes["on:click"]
    attr: HTMLButtonAttributes
  }
  $: {
    switch (state.mode) {
      case "editing": {
        button = {
          label: "開始",
          attr: {
            type: "submit",
            class: clsx("circle-button circle-button-green"),
          },
        }
        break
      }

      case "running": {
        button = {
          label: "一時停止",
          onClick: () => {
            dispatch({
              type: "pause",
              at: serverTimestamp,
            })
          },
          attr: {
            type: "button",
            class: clsx("circle-button circle-button-orange"),
          },
        }
        break
      }

      case "paused": {
        button = {
          label: "再開",
          onClick: () => {
            if (pending) return

            dispatch({
              type: "resume",
              at: serverTimestamp,
            })
          },
          attr: {
            type: "button",
            class: clsx("circle-button circle-button-green"),
          },
        }
        break
      }
    }
  }

  const onSubmit = () => {
    if (state.mode !== "editing") return

    dispatch({
      type: "start",
      withDuration: duration,
      at: serverTimestamp,
    })
  }

  const onCancel = async () => {
    await dispatch({
      type: "cancel",
    })
  }
</script>

<div class={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
  <slot name="header"><div /></slot>

  <form
    aria-label="タイマーの値を設定"
    class="contents"
    on:submit|preventDefault={onSubmit}
  >
    <p id={id("status")} role="status" class="sr-only">
      {#if state.mode === "editing"}
        {`タイマーは編集中、値は${humanReadableLabelOf(state.initialDuration)}`}
      {:else if state.mode === "running"}
        {`タイマーは実行中、残り${humanReadableLabelOf(
          state.restDuration - (Date.now() - state.startedAt)
        )}`}
      {:else if state.mode === "paused"}
        {`タイマーは一時停止中、残り${humanReadableLabelOf(
          state.restDuration
        )}`}
      {/if}
    </p>

    <div id={id("timer")} class="relative grid place-items-center tabular-nums">
      {#if !locked && state.mode === "editing"}
        <div
          class="grid aspect-video w-[512px] max-w-[100vw] touch-pinch-zoom place-items-center"
        >
          {#key $initialDuration$}
            <DurationSelect bind:value={duration} />
          {/key}
        </div>
      {:else}
        <div class="absolute">
          <TimeViewer {timerState$} />
        </div>
      {/if}
    </div>

    <h2 class="sr-only">タイマーの操作</h2>

    <div class="flex items-center justify-around">
      {#if locked}
        <button
          aria-controls="{id('status')} {id('timer')}"
          type="button"
          disabled
          class="circle-button circle-button-gray text-2xl"
        >
          <Icon name="lock-outline" />
        </button>

        <button
          aria-controls="{id('status')} {id('timer')}"
          type="button"
          disabled
          class={clsx(
            "circle-button text-2xl",
            state.mode === "running"
              ? "circle-button-orange"
              : "circle-button-green"
          )}
        >
          <Icon name="lock-outline" />
        </button>
      {:else}
        <button
          aria-controls="{id('status')} {id('timer')}"
          type="button"
          disabled={state.mode === "editing"}
          class="circle-button circle-button-gray text-xs"
          on:click={onCancel}
        >
          キャンセル
        </button>

        <button {...button.attr} on:click={button.onClick}>
          {button.label}
        </button>
      {/if}
    </div>
  </form>

  <slot />
</div>
