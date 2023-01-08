import type { Firestore } from "firebase/firestore"
import { keyWithUseRoom } from "../useRoom.1"
import { keyWithUseSetup } from "../useSetup.1"
import { keyWithFirestore } from "./useFirestore.1"
import { useRoomImpl } from "./useRoomImpl"
import { useSetupImpl } from "./useSetupImpl"

export function firestoreImplContext(
  firestore: Firestore
): Map<unknown, unknown> {
  return new Map<unknown, unknown>([
    keyWithFirestore(firestore),
    keyWithUseRoom(useRoomImpl),
    keyWithUseSetup(useSetupImpl),
  ])
}
