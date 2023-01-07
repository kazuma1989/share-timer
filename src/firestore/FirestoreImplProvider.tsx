import type { Firestore } from "firebase/firestore"
// @ts-expect-error
import { ReactNode } from "react"
import { UseDispatchProvider } from "../useDispatch"
import { UseLockRoomProvider } from "../useLockRoom"
import { UseRoomProvider } from "../useRoom"
import { UseSetupProvider } from "../useSetup"
import { UseTimerStateProvider } from "../useTimerState"
import { useDispatchImpl } from "./useDispatchImpl"
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
