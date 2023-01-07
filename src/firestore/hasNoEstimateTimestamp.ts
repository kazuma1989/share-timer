import type { SnapshotMetadata } from "firebase/firestore"

export function hasNoEstimateTimestamp(
  metadata: SnapshotMetadata | undefined
): boolean {
  return !!metadata && !metadata.fromCache && !metadata.hasPendingWrites
}
