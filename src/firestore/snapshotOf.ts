import {
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
  Query,
  QuerySnapshot,
} from "firebase/firestore"
import { Observable } from "rxjs"

export function snapshotOf(
  reference: DocumentReference
): Observable<DocumentSnapshot>

export function snapshotOf(query: Query): Observable<QuerySnapshot>

export function snapshotOf(
  referenceOrQuery: DocumentReference | Query
): Observable<DocumentSnapshot | QuerySnapshot> {
  return new Observable<any>((subscriber) =>
    onSnapshot(referenceOrQuery as any, (doc: unknown) => {
      subscriber.next(doc)
    })
  )
}
