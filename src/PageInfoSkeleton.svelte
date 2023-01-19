<script lang="ts">
  import clsx from "clsx"

  export { className as class }
  let className: string = ""
</script>

<div
  class={clsx(
    "pointer-events-none mx-auto h-screen max-w-prose select-none",
    "prose-theme-base px-6",
    "animate-pulse text-dark/20 dark:text-white/30",
    className
  )}
>
  <div class="mt-16 mb-8 h-12">
    <span class="inline-block bg-current mt-4 w-52 h-8 rounded" />
  </div>

  <div class="mb-5">
    <span class="inline-block bg-current w-20 h-2 rounded" />
    <span class="inline-block bg-current w-40 h-2 rounded" />
    <br />
    <span class="inline-block bg-current w-32 h-2 rounded" />
  </div>
</div>
