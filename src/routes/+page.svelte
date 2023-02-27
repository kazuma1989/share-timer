<script lang="ts" context="module">
  import smallAlert from "$lib/assets/small-alert.mp3"
  import { observeAudioPermission } from "$lib/observeAudioPermission"
  import {
    createAudio,
    keyWithAudio,
    keyWithMediaPermission,
  } from "$lib/useAudio"
  import { firestoreImplContext } from "../firestore/firestoreImplContext"
  import { initRemoteFirestore } from "../firestore/initRemoteFirestore"
  import { keyWithDarkMode, observeDarkMode } from "../useDarkMode"
  import { createVideoTimer, keyWithVideoTimer } from "../useVideoTimer"

  const context$ = (async () => {
    if (!browser) throw "client-side only context"

    const darkMode$ = observeDarkMode()

    const context = new AudioContext()
    const permission$ = observeAudioPermission(context)

    const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
    const audio = createAudio(context, audioData)

    const video = createVideoTimer()

    const firestore = await initRemoteFirestore()

    return new Map([
      ...firestoreImplContext(firestore),
      keyWithAudio(audio),
      keyWithMediaPermission(permission$),
      keyWithDarkMode(darkMode$),
      keyWithVideoTimer(video),
    ])
  })()
</script>

<script lang="ts">
  import { browser } from "$app/environment"
  import { observeRoute, replaceHash } from "$lib/observeHash"
  import SetContext from "$lib/SetContext.svelte"
  import { newRoomId } from "../schema/roomSchema"
  import PageRoom from "./PageRoom.svelte"
  import PageRoomSkeleton from "./PageRoomSkeleton.svelte"

  const route$ = observeRoute()

  $: if (browser) {
    const [route, , mode] = $route$

    if (route !== "room") {
      replaceHash(["room", newRoomId(mode)])
    }
  }
</script>

<div class="peer contents">
  {#await context$ then context}
    <SetContext {context}>
      {#if $route$[0] === "room"}
        {@const [, roomId] = $route$}

        <PageRoom {roomId} />
      {/if}
    </SetContext>
  {/await}
</div>

<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
