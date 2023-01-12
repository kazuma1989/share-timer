import { proxy, wrap } from "comlink"
import {
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
  Query,
  QuerySnapshot,
} from "firebase/firestore"
import { Observable } from "rxjs"
import type { RemoteFirestore } from "./worker"
import FirestoreWorker from "./worker?worker"

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

const F = wrap<typeof RemoteFirestore>(new FirestoreWorker())

const f = await new F(
  await fetch("/__/firebase/init.json").then((_) => _.json())
)

f.onSnapshotRoom(
  "gin-tzhe-whi" as any,
  proxy((data) => {
    console.log(data)
  })
)
