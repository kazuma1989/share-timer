<script lang="ts">
  import "../global.css"
  import SplashScreen from "./SplashScreen.svelte"
</script>

<svelte:head>
  <title>Share Timer</title>
</svelte:head>

<slot />

<div class="peer-hidden">
  <SplashScreen />
</div>

<style>
  .peer-hidden {
    transition: 0.3s ease-in;
    transition-property: opacity, visibility;
  }

  :global(:not(:empty)) + .peer-hidden {
    opacity: 0;
    visibility: hidden;
  }
</style>
