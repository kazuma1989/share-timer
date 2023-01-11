<script lang="ts">
  import Icon from "./Icon.svelte"
  import { useMediaPermission } from "./useAudio"
  import { toggleConfig, useConfig } from "./useConfig"
  import { getId } from "./util/getId"

  export { className as class }
  let className: string = ""

  const _id = getId()
  const id = (_: "flash" | "sound") => _id + _

  const config$ = useConfig()
  $: config = $config$

  const permission$ = useMediaPermission()
  $: permission = $permission$
</script>

<div class={className}>
  <span id={id("flash")} role="status" class="sr-only">
    {#if config.flash === "on"}
      フラッシュはオンです
    {:else}
      フラッシュはオフです
    {/if}
  </span>

  <button
    aria-controls={id("flash")}
    type="button"
    title="フラッシュを切り替える"
    class="transparent-button h-12 w-12 text-2xl"
    on:click={() => {
      toggleConfig("flash")
    }}
  >
    {#if config.flash === "on"}
      <Icon name="flash" />
    {:else}
      <Icon name="flash-off" />
    {/if}
  </button>

  <span id={id("sound")} role="status" class="sr-only">
    {#if config.sound === "on" && permission === "canplay"}
      音はオンです
    {:else}
      音はオフです
    {/if}
  </span>

  <button
    aria-controls={id("sound")}
    type="button"
    title="音を切り替える"
    class="transparent-button h-12 w-12 text-2xl"
    on:click={() => {
      if (permission === "denied") return

      toggleConfig("sound")
    }}
  >
    {#if config.sound === "on" && permission === "canplay"}
      <Icon name="volume-high" />
    {:else}
      <Icon name="volume-off" />
    {/if}
  </button>

  <button
    type="button"
    title="情報を開く"
    class="transparent-button h-12 w-12 text-2xl"
    on:click
  >
    <Icon name="information" />
  </button>

  <!-- TODO tutorial dialog を開く機能 -->
</div>
