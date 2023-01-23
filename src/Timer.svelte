<script lang="ts">
  import clsx from "clsx"
  import { distinctUntilChanged, map, type Observable } from "rxjs"
  import type { HTMLButtonAttributes } from "svelte/elements"
  import DurationSelect from "./DurationSelect.svelte"
  import Icon from "./Icon.svelte"
  import { now } from "./now"
  import type { Room } from "./schema/roomSchema"
  import type { TimerState } from "./schema/timerReducer"
  import { serverTimestamp } from "./serverTimestamp"
  import { getItem } from "./storage"
  import TimeViewer from "./TimeViewer.svelte"
  import { useDispatch } from "./useDispatch"
  import { getId } from "./util/getId"
  import { humanReadableLabelOf } from "./util/humanReadableLabelOf"

  export let room$: Observable<Room>
  export let timerState$: Observable<TimerState>
  export { className as class }
  let className: string = ""

  const _id = getId()
  const id = (_: "timer" | "status") => _id + _

  $: state = $timerState$
  $: ({ id: roomId, lockedBy } = $room$)

  $: initialDuration$ = timerState$.pipe(
    map((_) => _.initialDuration),
    distinctUntilChanged()
  )
  $: duration = $initialDuration$

  $: locked = lockedBy && lockedBy !== getItem("userId")
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

  let cancel: HTMLElement
  let select: DurationSelect
  const onCancel = async () => {
    const currentFocus = document.activeElement

    await dispatch({
      type: "cancel",
    })

    if (cancel === currentFocus) {
      select.focus()
    }
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
          state.restDuration - (now() - state.startedAt)
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
            <DurationSelect bind:value={duration} bind:this={select} />
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
          bind:this={cancel}
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
