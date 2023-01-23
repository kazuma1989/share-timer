<script lang="ts">
  import clsx from "clsx"
  import Icon from "./Icon.svelte"
  import QrCode from "./QRCode.svelte"
  import type { Room } from "./schema/roomSchema"
  import { getItem } from "./storage"
  import { fromRoute } from "./toRoute"
  import { AbortReason, useLockRoom } from "./useLockRoom"

  export let roomId: Room["id"]

  $: roomHash = `#${fromRoute(["room", roomId])}`
  $: roomURL = location.origin + location.pathname + roomHash

  const _lockRoom = useLockRoom()
  const lockRoom = async () => {
    const userId = getItem("userId")
    if (!userId) return

    const abort = new AbortController()

    await _lockRoom(roomId, userId, {
      signal: abort.signal,
      onBeforeUpdate() {
        const confirmed = confirm(
          "解除の方法はありませんが、本当にロックしますか？"
        )
        if (!confirmed) {
          throw AbortReason("user-deny")
        }
      },
    }).catch((reason: AbortReason) => {
      switch (reason) {
        case "already-locked": {
          alert("すでにロックされています")
          break
        }

        case "user-deny": {
          break
        }

        default: {
          throw reason
        }
      }
    })
  }
</script>

<article
  class={clsx(
    "mx-auto h-screen max-w-prose",
    "prose-theme-base",
    "grid grid-rows-[1fr_auto]",
    "px-6"
  )}
>
  <div>
    <a
      title="タイマーに戻る"
      href={roomHash}
      class="transparent-button my-2 -ml-4 inline-grid h-12 w-12 place-items-center text-2xl !text-inherit"
    >
      <Icon name="arrow-left" />
    </a>

    <h1>
      <ruby>
        Share Timer <rp>(</rp>
        <rt class="text-xs">シェア タイマー</rt>
        <rp>)</rp>
      </ruby>
    </h1>

    <p>URL でタイマーを簡単共有！</p>

    <p class="text-center">
      <a href={roomURL} class="break-words">
        <QrCode
          data={roomURL}
          width={160}
          height={160}
          class="mb-2 inline-block"
        />
        <br />

        <span>
          {roomURL}
        </span>
      </a>
    </p>

    <p>
      <span class="before:content-['※_']">
        タイマーは誰でも開始／一時停止／キャンセルできます
      </span>
      <br />
      <span class="before:content-['※_']">
        カウントダウン中の数字部分をダブルタップすると…？
      </span>
    </p>

    <p>
      <a
        href="#new"
        target="_blank"
        class={clsx(
          "transparent-button block border border-gray-500 px-4 py-3 text-center no-underline after:content-['_↗']"
        )}
      >
        新しいタイマーを開く
      </a>
    </p>

    <p>
      <button
        type="button"
        class="transparent-button block w-full border border-gray-500 px-4 py-3"
        on:click={lockRoom}
      >
        編集をロックする (experimental)
      </button>
    </p>
  </div>

  <footer>
    <p class="text-center">
      <small>
        Crafted by
        <a
          href="https://github.com/kazuma1989"
          target="_blank"
          rel="noopener noreferrer"
        >
          @kazuma1989
        </a>
      </small>
    </p>
  </footer>
</article>
