<script lang="ts">
  import clsx from "clsx"

  export { className as class }
  let className: string = ""
</script>

<div class={clsx("grid h-screen place-items-center", className)}>
  <progress class="circle-progress h-60 w-60 border-[medium]" />
</div>
