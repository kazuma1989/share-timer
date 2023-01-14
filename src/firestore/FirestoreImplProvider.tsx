import type { Firestore } from "firebase/firestore"
// @ts-expect-error
import { ReactNode } from "react"
// @ts-expect-error
import { UseDispatchProvider } from "../useDispatch"
// @ts-expect-error
import { UseLockRoomProvider } from "../useLockRoom"
// @ts-expect-error
import { UseRoomProvider } from "../useRoom"
// @ts-expect-error
import { UseSetupProvider } from "../useSetup"
// @ts-expect-error
import { UseTimerStateProvider } from "../useTimerState"
import { useDispatchImpl } from "./useDispatchImpl"
// @ts-expect-error
import { FirestoreProvider } from "./useFirestore"
import { useLockRoomImpl } from "./useLockRoomImpl"
import { useRoomImpl } from "./useRoomImpl"
import { useSetupImpl } from "./useSetupImpl"
import { useTimerStateImpl } from "./useTimerStateImpl"

export function FirestoreImplProvider({
  firestore,
  children,
}: {
  firestore: Firestore
  children?: ReactNode
}) {
  return (
    <FirestoreProvider value={firestore}>
      <UseDispatchProvider value={useDispatchImpl}>
        <UseLockRoomProvider value={useLockRoomImpl}>
          <UseRoomProvider value={useRoomImpl}>
            <UseSetupProvider value={useSetupImpl}>
              <UseTimerStateProvider value={useTimerStateImpl}>
                {children}
              </UseTimerStateProvider>
            </UseSetupProvider>
          </UseRoomProvider>
        </UseLockRoomProvider>
      </UseDispatchProvider>
    </FirestoreProvider>
  )
}
