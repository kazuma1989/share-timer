<script lang="ts">
  import { page } from "$app/stores"
  import Icon from "$lib/Icon.svelte"
  import clsx from "clsx"

  export let status: number = $page.status
</script>

<div class={clsx("mx-auto h-screen max-w-prose", "prose-theme-base", "px-6")}>
  <div class="h-0">
    <a
      title="タイマーに戻る"
      href="/"
      class="transparent-button my-2 -ml-4 inline-grid h-12 w-12 place-items-center text-2xl"
    >
      <Icon name="arrow-left" />
    </a>
  </div>

  <h1 class="mt-16">
    <ruby>
      Share Timer <rp>(</rp>
      <rt class="text-xs">シェア タイマー</rt>
      <rp>)</rp>
    </ruby>
  </h1>

  <div class="text-9xl text-center">{status}</div>
</div>
