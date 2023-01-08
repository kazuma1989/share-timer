<script lang="ts">
  import type { Observable } from "rxjs"
  import FullViewportProgress from "./FullViewportProgress.svelte"
  import type { Route } from "./toRoute"

  export let route$: Observable<Route>
</script>

<div class="peer">
  {#if $route$[0] === "info"}
    {@const [, roomId] = $route$}

    {#await import("./PageInfo.svelte") then { default: PageInfo }}
      <PageInfo {roomId} />
    {/await}
  {:else if $route$[0] === "room"}
    {@const [, roomId] = $route$}

    room ({roomId})
  {:else if $route$[0] === "newRoom"}
    newRoom
  {:else if $route$[0] === "unknown"}
    {@const [, payload] = $route$}

    404 &quot;{payload}&quot;
  {/if}
</div>

<div class="hidden peer-empty:contents">
  <FullViewportProgress />
</div>
