import { SnapshotMetadata } from "firebase/firestore"

export function hasNoEstimateTimestamp(metadata: SnapshotMetadata): boolean {
  return !metadata.fromCache && !metadata.hasPendingWrites
}
