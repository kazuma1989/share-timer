// @ts-expect-error
import { StrictMode, Suspense } from "react"
// @ts-expect-error
import { createRoot } from "react-dom/client"
import { of } from "rxjs"
import { ErrorBoundary } from "./ErrorBoundary"
import { FullViewportOops } from "./FullViewportOops"
import { FullViewportProgress } from "./FullViewportProgress"
import "./global.css"
import { observeAudioPermission } from "./observeAudioPermission"
import type { Room } from "./schema/roomSchema"
import smallAlert from "./sound/small-alert.mp3"
import { Timer } from "./Timer"
import type { TimerState } from "./timerReducer"
// @ts-expect-error
import { AudioProvider, createAudio, MediaPermissionProvider } from "./useAudio"

const root = document.getElementById("root")!

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
            <Timer
              room$={of({
                id: "" as Room["id"],
                name: "hello",
              } satisfies Room)}
              timerState$={of({
                initialDuration: 3 * 60_000,
                mode: "paused",
                restDuration: 2 * 60_000,
              } satisfies TimerState)}
            />
          </Suspense>
        </MediaPermissionProvider>
      </AudioProvider>
    </ErrorBoundary>
  </StrictMode>
)
