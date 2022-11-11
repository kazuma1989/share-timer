import { Firestore } from "firebase/firestore"
import { Observable } from "rxjs"
import { InvalidDoc } from "./mapToRoom"
import { setupRoom } from "./setupRoom"
import { pauseWhileLoop } from "./util/pauseWhileLoop"
import { sparse } from "./util/sparse"

export function initializeRoom(
  db: Firestore,
  invalid$: Observable<InvalidDoc>
): void {
  let abort = new AbortController()

  invalid$
    .pipe(
      sparse(200),
      pauseWhileLoop({
        criteria: import.meta.env.PROD ? 20 : 5,
        debounce: 2_000,
        onLoopDetected() {
          throw new Error(
            "Detect room initialization loop. Something went wrong"
          )
        },
      })
    )
    .subscribe(async ([, roomId]) => {
      abort.abort()
      abort = new AbortController()

      await setupRoom(db, roomId).catch((_: unknown) => {
        console.debug("aborted setup room", _)
      })
    })
}
