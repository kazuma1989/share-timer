<script lang="ts">
  import clsx from "clsx"
  import Icon from "./Icon.svelte"

  const roomURL = "#"
</script>

<article
  class={clsx(
    "mx-auto h-screen max-w-prose",
    "text-dark/90 dark:text-light/90",
    "prose prose-headings:text-dark/70 prose-a:text-azure-700 dark:prose-headings:text-light/70 dark:prose-a:text-azure-300",
    "grid grid-rows-[1fr_auto]",
    "px-6"
  )}
>
  <div>
    <button
      type="button"
      class="my-2 -ml-4 h-12 w-12 text-2xl"
      on:click={() => {
        console.log("back")
      }}
    >
      <Icon name="arrow-left" />
    </button>

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
        <!-- <QRCode
          data={roomURL}
          width={160}
          height={160}
          class="mb-2 inline-block"
        /> -->
        <br />

        <span>{roomURL}</span>
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
        href="#"
        target="_blank"
        class={clsx(
          "block border border-gray-500 px-4 py-3 text-center no-underline after:content-['_↗']",
          // FIXME TransparentButtonと同じスタイルなのでなんとかコンポーネントにまとめられないか
          "cursor-pointer rounded-md transition-colors",
          "hover:bg-dark/10 active:bg-dark/20 dark:hover:bg-light/20 dark:active:bg-light/30"
        )}
      >
        新しいタイマーを開く
      </a>
    </p>

    <p>
      <button
        type="button"
        class="block w-full border border-gray-500 px-4 py-3"
      >
        編集をロックする (experimental)
      </button>
    </p>
  </div>

  <footer>
    <p class="text-center">
      <small>
        Crafted by{" "}
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
