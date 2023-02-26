<script lang="ts">
  import { observeRoute } from "$lib/observeHash"
  import PageInfo from "../../PageInfo.svelte"
  import PageInfoSkeleton from "../../PageInfoSkeleton.svelte"

  const route$ = observeRoute()
</script>

<div class="peer contents">
  {#if $route$[0] === "room"}
    {@const [, roomId] = $route$}

    <PageInfo {roomId} />
  {/if}
</div>

<div class="hidden peer-empty:contents">
  <PageInfoSkeleton />
</div>
