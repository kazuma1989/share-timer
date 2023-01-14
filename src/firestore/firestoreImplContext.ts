import type { Remote } from "comlink"
import { keyWithUseDispatch } from "../useDispatch"
import { keyWithUseLockRoom } from "../useLockRoom"
import { keyWithUseRoom } from "../useRoom"
import { keyWithUseSetup } from "../useSetup"
import { keyWithUseTimerState } from "../useTimerState"
import type { RemoteFirestore } from "./RemoteFirestore.worker"
import { useDispatchImpl } from "./useDispatchImpl"
import { keyWithFirestore } from "./useFirestore"
import { useLockRoomImpl } from "./useLockRoomImpl"
import { useRoomImpl } from "./useRoomImpl"
import { useSetupImpl } from "./useSetupImpl"
import { useTimerStateImpl } from "./useTimerStateImpl"

export function firestoreImplContext(
  firestore: Remote<RemoteFirestore>
): Map<unknown, unknown> {
  return new Map<unknown, unknown>([
    keyWithFirestore(firestore),
    keyWithUseDispatch(useDispatchImpl),
    keyWithUseLockRoom(useLockRoomImpl),
    keyWithUseRoom(useRoomImpl),
    keyWithUseSetup(useSetupImpl),
    keyWithUseTimerState(useTimerStateImpl),
  ])
}
