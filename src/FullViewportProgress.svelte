<script lang="ts">
  import clsx from "clsx"

  let className: string = ""
  export { className as class }
</script>

<div class={clsx("grid h-screen place-items-center", className)}>
  <progress class="circle-progress h-60 w-60 border-[medium]" />
</div>
