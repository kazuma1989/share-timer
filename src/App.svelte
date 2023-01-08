<script lang="ts">
  import type { Observable } from "rxjs"
  import FullViewportProgress from "./FullViewportProgress.svelte"
  import type { Route } from "./toRoute"

  export let route$: Observable<Route>
</script>

<div class="peer contents">
  {#if $route$[0] === "info"}
    {@const [, roomId] = $route$}

    {#await import("./PageInfo.svelte") then { default: PageInfo }}
      <PageInfo {roomId} />
    {/await}
  {:else if $route$[0] === "room"}
    {@const [, roomId] = $route$}

    <p>room ({roomId})</p>
  {:else if $route$[0] === "newRoom"}
    <p>newRoom</p>
  {:else if $route$[0] === "unknown"}
    {@const [, payload] = $route$}

    <p>404 &quot;{payload}&quot;</p>
  {/if}
</div>

<div class="hidden peer-empty:contents">
  <FullViewportProgress />
</div>
