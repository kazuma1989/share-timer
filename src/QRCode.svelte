<script lang="ts">
  import clsx from "clsx"
  import { qrToSVG } from "./util/qrToSVG"

  export let data: string
  export let width: number
  export let height: number
  export { className as class }
  let className: string = ""

  $: svg$ = qrToSVG(data)
</script>

{#await svg$ then { size, d }}
  <svg
    class={clsx("bg-white text-black", className)}
    viewBox="0 0 {size} {size}"
    {width}
    {height}
  >
    <path stroke="transparent" fill="currentColor" {d} />
  </svg>
{/await}
