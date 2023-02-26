<script lang="ts">
  import "../global.css"
</script>

<svelte:head>
  <title>Share Timer</title>
</svelte:head>

<!-- https://neos21.net/blog/2018/08/19-01.html -->
<svelte:body on:touchstart|passive={() => {}} />

<slot />
