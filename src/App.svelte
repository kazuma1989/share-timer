<script lang="ts">
  import { of, type Observable } from "rxjs"
  import FullViewportProgress from "./FullViewportProgress.svelte"
  import { replaceHash } from "./observeHash"
  import PageRoom from "./PageRoom.svelte"
  import type { Route } from "./toRoute"
  import { provideUseRoom } from "./useRoom.1"
  import { newRoomId, type Room } from "./zod/roomZod"

  export let route$: Observable<Route>

  provideUseRoom((roomId) =>
    of({
      id: roomId,
      name: `another mocked room (${Math.random()})`,
    } satisfies Room)
  )

  $: {
    const [route] = $route$
    if (route === "newRoom") {
      replaceHash(["room", newRoomId()])
    }
  }
</script>

<div class="peer contents">
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
</div>

<div class="hidden peer-empty:contents">
  <FullViewportProgress />
</div>
