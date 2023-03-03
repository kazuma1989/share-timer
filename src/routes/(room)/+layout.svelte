<script lang="ts">
  import { setContext } from "svelte"
  import type { LayoutData } from "./$types"

  export let data: LayoutData

  data.context?.forEach((value, key) => {
    setContext(key, value)
  })
</script>

<svelte:head>
  <title>Share Timer</title>
</svelte:head>

<slot />
