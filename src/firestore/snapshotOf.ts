import { wrap } from "comlink"
import {
  DocumentReference,
  DocumentSnapshot,
  onSnapshot,
  Query,
  QuerySnapshot,
} from "firebase/firestore"
import { Observable } from "rxjs"
import type { Firestore } from "./worker"
import W from "./worker?worker"

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

const F = wrap<typeof Firestore>(new W())

const f = await new F()

f.snapshot()
