<script lang="ts">
  import smallAlert from "$lib/assets/small-alert.mp3"
  import { observeAudioPermission } from "$lib/observeAudioPermission"
  import {
    createAudio,
    keyWithAudio,
    keyWithMediaPermission,
  } from "$lib/useAudio"
  import { onMount } from "svelte"
  import App from "../App.svelte"
  import { firestoreImplContext } from "../firestore/firestoreImplContext"
  import { initRemoteFirestore } from "../firestore/initRemoteFirestore"
  import { observeHash } from "../observeHash"
  import PageRoomSkeleton from "../PageRoomSkeleton.svelte"
  import Skeleton from "../Skeleton.svelte"
  import { keyWithDarkMode, observeDarkMode } from "../useDarkMode"
  import { createVideoTimer, keyWithVideoTimer } from "../useVideoTimer"

  let root: HTMLElement | undefined

  onMount(async () => {
    const darkMode$ = observeDarkMode()

    const context = new AudioContext()
    const permission$ = observeAudioPermission(context)

    const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
    const audio = createAudio(context, audioData)

    const video = createVideoTimer()

    const route$ = observeHash()

    const firestore = await initRemoteFirestore()

    new App({
      target: root!,
      props: {
        route$,
      },
      context: new Map([
        ...firestoreImplContext(firestore),
        keyWithAudio(audio),
        keyWithMediaPermission(permission$),
        keyWithDarkMode(darkMode$),
        keyWithVideoTimer(video),
      ]),
    })
  })
</script>

<Skeleton bind:appRoot={root}>
  <PageRoomSkeleton />
</Skeleton>
