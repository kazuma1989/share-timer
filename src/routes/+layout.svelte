<script lang="ts">
  import { setContext } from "svelte"
  import "../global.css"
  import type { LayoutData } from "./$types"

  export let data: LayoutData

  data.context?.forEach((value, key) => {
    setContext(key, value)
  })
</script>

<svelte:head>
  <title>Share Timer</title>
</svelte:head>

<!-- https://neos21.net/blog/2018/08/19-01.html -->
<svelte:body on:touchstart|passive={() => {}} />

<slot />
