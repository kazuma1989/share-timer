<script lang="ts">
  import { onMount } from "svelte"
  import main from "../main"

  let root: HTMLElement

  onMount(async () => {
    await main(root)
  })
</script>

<div bind:this={root} />
