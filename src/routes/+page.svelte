<script lang="ts">
  import { browser } from "$app/environment"
  import { observeRoute, replaceHash } from "$lib/observeHash"
  import { newRoomId } from "$lib/schema/roomSchema"
  import { setContext } from "svelte"
  import type { PageData } from "./$types"
  import PageRoom from "./PageRoom.svelte"
  import PageRoomSkeleton from "./PageRoomSkeleton.svelte"

  export let data: PageData

  console.log("setContext!")
  data.context?.forEach((value, key) => {
    setContext(key, value)
  })

  const route$ = observeRoute()

  $: if (browser) {
    const [route, , mode] = $route$

    if (route !== "room") {
      replaceHash(["room", newRoomId(mode)])
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
