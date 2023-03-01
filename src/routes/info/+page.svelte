<script lang="ts">
  import { afterNavigate } from "$app/navigation"
  import { page } from "$app/stores"
  import Icon from "$lib/Icon.svelte"
  import { observeRoute } from "$lib/observeRoute"
  import QrCode from "$lib/QRCode.svelte"
  import { fromRoute } from "$lib/toRoute"
  import type { AfterNavigate } from "@sveltejs/kit"
  import clsx from "clsx"
  import { map, Observable } from "rxjs"

  const roomId$ = observeRoute().pipe(
    map(([_, roomId]) => (_ === "room" ? roomId : undefined))
  )

  $: roomHash = $roomId$ ? "#" + fromRoute(["room", $roomId$]) : ""
  $: roomURL = roomHash ? $page.url.origin + "/" + roomHash : ""

  const lockRoom = async () => {
    const ok = window.confirm("まずはサインインが必要です")
    if (!ok) return

    const { pathname, search, hash } = $page.url

    window.location.assign(
      "/sign-in/" +
        "?" +
        new URLSearchParams({
          back: pathname + search + hash,
          ...(import.meta.env.VITE_FIRESTORE_EMULATOR
            ? {
                emulator:
                  import.meta.env.FIREBASE_EMULATORS.auth.port.toString(),
              }
            : {}),
        })
    )
  }

  const nav$ = new Observable<AfterNavigate>((sub) => {
    afterNavigate((nav) => {
      sub.next(nav)
    })
  })
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
    {#if roomHash}
      <a
        title="タイマーに戻る"
        href="/{roomHash}"
        class="transparent-button my-2 -ml-4 inline-grid h-12 w-12 place-items-center text-2xl"
        on:click={(e) => {
          if (e.currentTarget.href !== $nav$.from?.url.toString()) return

          e.preventDefault()
          window.history.back()
        }}
      >
        <Icon name="arrow-left" />
      </a>
    {:else}
      <div class="my-2 h-12 w-12" />
    {/if}

    <h1>
      <ruby>
        Share Timer <rp>(</rp>
        <rt class="text-xs">シェア タイマー</rt>
        <rp>)</rp>
      </ruby>
    </h1>

    <p>URL でタイマーを簡単共有！</p>

    <p class="text-center">
      {#if roomURL}
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
      {:else}
        <span class={clsx("animate-pulse text-dark/20 dark:text-white/30")}>
          <span
            class={clsx("inline-block h-[160px] w-[160px] rounded bg-current")}
          />
          <br />
          <span class={clsx("inline-block h-2 w-64 rounded bg-current")} />
        </span>
      {/if}
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
        href="/"
        target="_blank"
        class={clsx(
          "transparent-button block border border-gray-500 px-4 py-3 after:content-['_↗']"
        )}
      >
        新しいタイマーを開く
      </a>
    </p>

    {#if import.meta.env.DEV}
      <p>
        <a
          href="/checkout/"
          class={clsx(
            "transparent-button block border border-gray-500 px-4 py-3"
          )}
        >
          購入画面を開く (experimental)
        </a>
      </p>
    {/if}

    {#if import.meta.env.DEV}
      <p>
        <button
          type="button"
          class="transparent-button block w-full border border-gray-500 px-4 py-3"
          on:click={lockRoom}
        >
          編集をロックする (experimental)
        </button>
      </p>
    {/if}
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
