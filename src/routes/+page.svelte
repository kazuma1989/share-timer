<script lang="ts">
  import { browser } from "$app/environment"
  import { observeRoute, replaceRoute } from "$lib/observeRoute"
  import { newRoomId } from "$lib/schema/roomSchema"
  import PageRoom from "./PageRoom.svelte"
  import PageRoomSkeleton from "./PageRoomSkeleton.svelte"

  const route$ = observeRoute()

  $: if (browser) {
    const [route, , mode] = $route$

    if (route !== "room") {
      replaceRoute(["room", newRoomId(mode)])
    }
  }
</script>

<div class="peer contents">
  {#if $route$[0] === "room"}
    {@const [, roomId] = $route$}

    <PageRoom {roomId} />
  {/if}
</div>

<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
