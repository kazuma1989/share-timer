<script lang="ts">
  import type { Permission } from "$lib/observeAudioPermission"
  import {
    keyWithAudio,
    keyWithMediaPermission,
    type Audio,
  } from "$lib/useAudio"
  import type { Remote } from "comlink"
  import type { Observable } from "rxjs"
  import { setContext } from "svelte"
  import { firestoreImplContext } from "../firestore/firestoreImplContext"
  import type { RemoteFirestore } from "../firestore/worker/RemoteFirestore.worker"
  import { keyWithDarkMode } from "../useDarkMode"
  import { keyWithVideoTimer } from "../useVideoTimer"

  export let audio: Audio
  export let permission$: Observable<Permission>
  export let darkMode$: Observable<"dark" | "light">
  export let video: HTMLVideoElement
  export let firestore: Remote<RemoteFirestore>

  firestoreImplContext(firestore).forEach((value, key) => {
    setContext(key, value)
  })

  setContext(...keyWithAudio(audio))
  setContext(...keyWithMediaPermission(permission$))
  setContext(...keyWithDarkMode(darkMode$))
  setContext(...keyWithVideoTimer(video))
</script>

<slot />
