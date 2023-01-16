<script lang="ts">
  import clsx from "clsx"
  import { placeDialog } from "./action/placeDialog"
  import { showModal } from "./action/showModal"
  import Icon from "./Icon.svelte"
  import { getItem, setItem } from "./storage"
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

  let infoButton: HTMLButtonElement

  const isTutorialDone = getItem("tutorial") === "done"
  const doneTutorial = () => {
    setItem("tutorial", "done")
  }
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
    bind:this={infoButton}
  >
    <Icon name="information" />
  </button>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <dialog
    class={clsx(
      "transition-[box-shadow,opacity,visibility] [&:not([open])]:opacity-0",
      "overflow-visible rounded-sm bg-transparent text-inherit",
      "open:shadow-screen open:shadow-dark/10 dark:open:shadow-light/20",
      // override default dialog style
      "fixed inset-0 m-0 max-h-full max-w-full p-0 backdrop:bg-transparent open:visible [&:not([open])]:invisible [&:not([open])]:block"
    )}
    use:showModal={!isTutorialDone}
    use:placeDialog={infoButton}
    on:close={doneTutorial}
    on:click={({ target, currentTarget: dialog }) => {
      if (target === dialog) {
        dialog.close()
      }
    }}
  >
    <form method="dialog" class="contents">
      <article
        class={clsx(
          "max-w-prose overscroll-contain rounded border px-6 py-4 pt-8",
          "prose-theme-base",
          "absolute right-0 bottom-0 w-80 translate-x-14 -translate-y-14",
          "border-gray-500 bg-light before:border-t-gray-500 after:border-t-light dark:bg-dark dark:after:border-t-dark",
          "before:absolute before:left-3/4 before:bottom-0 before:translate-y-full before:-translate-x-1/2 before:border-8 before:border-transparent before:content-['']",
          "after:absolute after:left-3/4 after:bottom-0 after:translate-y-full after:-translate-x-1/2 after:border-[6.5px] after:border-transparent after:content-['']"
        )}
      >
        <p>タイマーを共有したり新しくつくったりするには、ここをタップ！</p>

        <p class="text-right">
          <button type="submit" class="transparent-button px-4 py-1">
            OK
          </button>
        </p>
      </article>
    </form>
  </dialog>
</div>
