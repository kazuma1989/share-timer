import { StrictMode, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { App } from "./App"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { observeAudioPermission } from "./observeAudioPermission"
import { observeHash } from "./observeHash"
import smallAlert from "./sound/small-alert.mp3"
import { AudioProvider, createAudio, MediaPermissionProvider } from "./useAudio"

const root = document.getElementById("root")!

const route$ = observeHash()

const context = new AudioContext()
const permission$ = observeAudioPermission(context)

const audioData = await fetch(smallAlert).then((_) => _.arrayBuffer())
const audio = createAudio(context, audioData)

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary fallback={<FullViewportOops />}>
      <AudioProvider value={audio}>
        <MediaPermissionProvider value={permission$}>
          <Suspense fallback={<FullViewportProgress />}>
            <App route$={route$} />
          </Suspense>
        </MediaPermissionProvider>
      </AudioProvider>
    </ErrorBoundary>
  </StrictMode>
)
