<script lang="ts">
  import { setContext } from "svelte"

  export let context: Map<any, any>

  context.forEach((value, key) => {
    setContext(key, value)
  })
</script>

<slot />
