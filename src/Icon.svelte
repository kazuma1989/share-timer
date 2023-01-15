<script lang="ts">
  import clsx from "clsx"
  import icons from "./icon.json"

  /**
   * @see https://materialdesignicons.com
   */
  export let name: keyof typeof icons
  export { className as class }
  let className: string = ""
</script>

<svg
  class={clsx("inline-block h-[1em] w-[1em] align-[-0.15em]", className)}
  viewBox="0 0 24 24"
>
  <path fill="currentColor" d={icons[name]} />
</svg>
