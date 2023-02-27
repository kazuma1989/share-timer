<script lang="ts">
  import { observeRoute } from "$lib/observeHash"
  import { map } from "rxjs"
  import PageInfo from "../../PageInfo.svelte"

  const roomId$ = observeRoute().pipe(
    map(([_, roomId]) => (_ === "room" ? roomId : undefined))
  )
</script>

<PageInfo roomId={$roomId$} />
