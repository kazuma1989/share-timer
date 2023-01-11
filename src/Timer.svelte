<script lang="ts">
  import clsx from "clsx"
  import { map, type Observable } from "rxjs"
  import type { HTMLButtonAttributes } from "svelte/elements"
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
  export { className as class }
  let className: string = ""

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

  let duration: number
  let prev: number
  $: {
    const current = $timerState$?.initialDuration
    if (current !== prev) {
      duration = current
    }

    prev = current
  }

  let button: HTMLButtonAttributes & { label: string }
  $: {
    switch ($timerState$?.mode) {
      case "editing": {
        button = {
          label: "開始",
          type: "submit",
          class: clsx("circle-button circle-button-green"),
        }
        break
      }

      case "running": {
        button = {
          label: "一時停止",
          type: "button",
          class: clsx("circle-button circle-button-orange"),
          "on:click": () => {
            dispatch({
              type: "pause",
              at: new ServerTimestamp(now()),
            })
          },
        }
        break
      }

      case "paused": {
        button = {
          label: "再開",
          type: "button",
          class: clsx("circle-button circle-button-green"),
          "on:click": () => {
            if (pending) return

            dispatch({
              type: "resume",
              at: new ServerTimestamp(now()),
            })
          },
        }
        break
      }
    }
  }

  const onSubmit = () => {
    if ($timerState$.mode !== "editing") return

    dispatch({
      type: "start",
      withDuration: duration,
      at: new ServerTimestamp(now()),
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

{#if $timerState$}
  {@const state = $timerState$}

  <div class={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
    <div class="pt-2 text-center">
      <h1 aria-label="タイマーの名前: {roomName}">
        {roomName}
      </h1>
    </div>

    <form
      aria-label="タイマーの値を設定"
      class="contents"
      on:submit|preventDefault={onSubmit}
    >
      <p id={id("status")} role="status" class="sr-only">
        {$label$}
      </p>

      <div id={id("timer")} class="grid place-items-center tabular-nums">
        {#if !locked && state.mode === "editing"}
          <div
            class="grid aspect-video w-[512px] max-w-[100vw] touch-pinch-zoom place-items-center"
          >
            <DurationSelect bind:value={duration} bind:this={select} />
          </div>
        {:else}
          <TimeViewer {timerState$} />
        {/if}
      </div>

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
            class="circle-button circle-button-green text-2xl"
            class:!circle-button-orange={state.mode === "running"}
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

          <button {...button} on:click={button["on:click"]}>
            {button.label}
          </button>
        {/if}
      </div>
    </form>
  </div>
{/if}
