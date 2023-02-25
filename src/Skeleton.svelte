<script lang="ts">
  export let appRoot: HTMLElement | undefined = undefined
</script>

<div class="peer contents" bind:this={appRoot} />
<div class="hidden peer-empty:contents">
  <slot />
</div>
