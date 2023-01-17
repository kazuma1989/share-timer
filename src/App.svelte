<script lang="ts">
  import type { Observable } from "rxjs"
  import { replaceHash } from "./observeHash"
  import PageRoom from "./PageRoom.svelte"
  import { newRoomId } from "./schema/roomSchema"
  import type { Route } from "./toRoute"

  export let route$: Observable<Route>

  $: {
    const [route] = $route$
    if (route === "newRoom") {
      replaceHash(["room", newRoomId()])
    }
  }
</script>

{#if $route$[0] === "info"}
  {@const [, roomId] = $route$}

  {#await import("./PageInfo.svelte") then { default: PageInfo }}
    <PageInfo {roomId} />
  {/await}
{:else if $route$[0] === "room"}
  {@const [, roomId] = $route$}

  <PageRoom {roomId} />
{:else if $route$[0] === "unknown"}
  {@const [, payload] = $route$}

  <p>404 &quot;{payload}&quot;</p>
{/if}
