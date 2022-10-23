import {
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
  Query,
  QuerySnapshot,
} from "firebase/firestore"
import { Observable, share, timer } from "rxjs"

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
  ).pipe(
    share({
      // リスナーがいなくなって30秒後に根元の購読も解除する
      resetOnRefCountZero: () => timer(30000),
    })
  )
}
