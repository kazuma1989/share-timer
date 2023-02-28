<script lang="ts">
  import { goto } from "$app/navigation"
  import { setContext } from "svelte"
  import "../global.css"
  import type { LayoutData } from "./$types"

  export let data: LayoutData

  data.context?.forEach((value, key) => {
    setContext(key, value)
  })
</script>

<svelte:window
  on:hashchange={(e) => {
    // よくわからんが page store が hashchange を拾わないので補っている
    // https://github.com/sveltejs/kit/issues/4554
    goto(e.newURL, { replaceState: true })
  }}
/>

<svelte:head>
  <title>Share Timer</title>
</svelte:head>

<!-- https://neos21.net/blog/2018/08/19-01.html -->
<svelte:body on:touchstart|passive={() => {}} />

<slot />
