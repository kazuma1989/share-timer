<script lang="ts">
  import { onMount } from "svelte"

  let root: HTMLElement

  onMount(async () => {
    const main = (await import("../main")).default

    main(root)
  })
</script>

<div id="root" bind:this={root} />
