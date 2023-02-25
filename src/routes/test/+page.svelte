<script lang="ts">
  import { browser } from "$app/environment"
  import { ifBrowser } from "$lib/ifBrowser"
  import { observeDarkMode } from "../../useDarkMode"

  const theme$ = ifBrowser(observeDarkMode, "light")

  theme$.subscribe((_) => {
    console.log(_)
  })
</script>

<p>theme: {$theme$}</p>

{#if browser}
  <h1>BROWSER YES</h1>
{:else}
  <h1>NODE_JS</h1>
{/if}
