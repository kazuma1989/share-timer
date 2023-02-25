<script lang="ts">
  import smallAlert from "$lib/assets/small-alert.mp3"
  import { observeAudioPermission } from "$lib/observeAudioPermission"
  import { createAudio } from "$lib/useAudio"
  import App from "../../App.svelte"
  import { initRemoteFirestore } from "../../firestore/initRemoteFirestore"
  import { observeHash } from "../../observeHash"
  import PageRoomSkeleton from "../../PageRoomSkeleton.svelte"
  import { observeDarkMode } from "../../useDarkMode"
  import { createVideoTimer } from "../../useVideoTimer"
  import Setup from "../Setup.svelte"

  async function setup() {
    const darkMode$ = observeDarkMode()

    const context = new AudioContext()
    const permission$ = observeAudioPermission(context)

    const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
    const audio = createAudio(context, audioData)

    const video = createVideoTimer()

    const route$ = observeHash()

    const firestore = await initRemoteFirestore()

    return {
      audio,
      permission$,
      darkMode$,
      video,
      firestore,
      route$,
    }
  }
</script>

<div class="peer contents">
  {#await setup() then { route$, ...props }}
    <Setup {...props}>
      <App {route$} />
    </Setup>
  {/await}
</div>

<div class="hidden peer-empty:contents">
  <PageRoomSkeleton />
</div>
