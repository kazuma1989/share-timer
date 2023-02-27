import {
  onSnapshot,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QuerySnapshot,
} from "firebase/firestore"
import { Observable } from "rxjs"

export function snapshotOf<T>(
  reference: DocumentReference<T>
): Observable<DocumentSnapshot<T>>

export function snapshotOf<T>(reference: Query<T>): Observable<QuerySnapshot<T>>

export function snapshotOf(
  reference: DocumentReference | Query
): Observable<DocumentSnapshot | QuerySnapshot> {
  return new Observable((subscriber) => {
    // @ts-expect-error runtime は問題ないが型だけがうまくいかないので黙らせておく
    const unsubscribe = onSnapshot(reference, (snapshot) => {
      subscriber.next(snapshot)
    })

    return unsubscribe
  })
}
