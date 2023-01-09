import type { Firestore } from "firebase/firestore"
import { keyWithUseRoom } from "../useRoom"
import { keyWithUseSetup } from "../useSetup"
import { keyWithUseTimerState } from "../useTimerState"
import { keyWithFirestore } from "./useFirestore"
import { useRoomImpl } from "./useRoomImpl"
import { useSetupImpl } from "./useSetupImpl"
import { useTimerStateImpl } from "./useTimerStateImpl"

export function firestoreImplContext(
  firestore: Firestore
): Map<unknown, unknown> {
  return new Map<unknown, unknown>([
    keyWithFirestore(firestore),
    keyWithUseRoom(useRoomImpl),
    keyWithUseSetup(useSetupImpl),
    keyWithUseTimerState(useTimerStateImpl),
  ])
}
