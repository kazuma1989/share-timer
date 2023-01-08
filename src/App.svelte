<script lang="ts">
  import FullViewportProgress from "./FullViewportProgress.svelte"
  import { setTimeout } from "./util/setTimeout"
</script>

<div class="peer">
  {#await setTimeout(2_000).then( () => import("./PageInfo.svelte") ) then { default: PageInfo }}
    <PageInfo />
  {/await}
</div>

<div class="hidden peer-empty:contents">
  <FullViewportProgress />
</div>
