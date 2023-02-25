<script lang="ts">
  import { onMount } from "svelte"
  import main from "../main"
  import PageRoomSkeleton from "../PageRoomSkeleton.svelte"
  import Skeleton from "../Skeleton.svelte"

  let root: HTMLElement | undefined
  onMount(async () => {
    await main(root!)
  })
</script>

<Skeleton bind:appRoot={root}>
  <PageRoomSkeleton />
</Skeleton>
