<script lang="ts">
  import clsx from "clsx"
  import Progress from "./Progress.svelte"

  let className: string = ""
  export { className as class }
</script>

<div class={clsx("grid h-screen place-items-center", className)}>
  <Progress class="h-60 w-60 border-[medium]" />
</div>
