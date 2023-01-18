<svelte:options accessors />

<script lang="ts">
  import PageRoomSkeleton from "./PageRoomSkeleton.svelte"

  export let appRoot: HTMLElement | null = null
</script>

<div class="peer contents" bind:this={appRoot} />
<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
