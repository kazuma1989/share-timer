<svelte:options accessors />

<script lang="ts">
  import type { ComponentType } from "svelte"

  export let appRoot: HTMLElement | null = null
  export let skeleton: ComponentType
</script>

<div class="peer contents" bind:this={appRoot} />
<div class="hidden peer-empty:contents">
  <svelte:component this={skeleton} />
</div>
