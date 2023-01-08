<script lang="ts">
  import clsx from "clsx"

  let className: string = ""
  export { className as class }
</script>

<progress
  class={clsx(
    "progress-bar-transparent inline-block min-h-[1rem] min-w-[1rem] animate-spin rounded-full border border-solid border-transparent border-t-current bg-transparent",
    className
  )}
/>
