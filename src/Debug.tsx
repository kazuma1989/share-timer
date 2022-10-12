/* eslint-disable no-console */
import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { collection } from "./collection"
import { useFirestore } from "./useFirestore"

export function Debug() {
  const db = useFirestore()

  return (
    <div>
      <p>
        <button
          type="button"
          onClick={async () => {
            const d = await getDoc(doc(collection(db, "rooms"), "xxx"))
            console.log(d.data())
          }}
        >
          Get single room
        </button>

        <button
          type="button"
          onClick={async () => {
            const docs = await getDocs(collection(db, "rooms"))
            console.log(docs.docs)
          }}
        >
          List all rooms
        </button>

        <button
          type="button"
          onClick={async () => {
            const { id } = await addDoc(collection(db, "rooms"), {
              // createdAt: serverTimestamp(),
              // のようにしないと、サーバーとクライアントの時刻は普通ずれているので、セキュリティルールで拒否されるはず。
              createdAt: Timestamp.now(),
            })
            console.log("room created", id)
          }}
        >
          Create invalid room
        </button>

        <button
          type="button"
          onClick={async () => {
            await deleteDoc(doc(collection(db, "rooms"), "xxx"))
          }}
        >
          Delete room
        </button>

        <button
          type="button"
          onClick={async () => {
            await updateDoc(doc(collection(db, "rooms"), "xxx"), {})
          }}
        >
          Update room
        </button>
      </p>

      <p>
        <button
          type="button"
          onClick={async () => {
            const d = await getDoc(
              doc(collection(db, "rooms", "xxx", "actions"), "xxx")
            )
            console.log(d.data())
          }}
        >
          Get single action
        </button>

        <button
          type="button"
          onClick={async () => {
            const docs = await getDocs(
              collection(db, "rooms", "xxx", "actions")
            )
            console.log(docs.docs)
          }}
        >
          List all actions
        </button>

        <button
          type="button"
          onClick={async () => {
            await deleteDoc(
              doc(collection(db, "rooms", "xxx", "actions"), "xxx")
            )
          }}
        >
          Delete action
        </button>

        <button
          type="button"
          onClick={async () => {
            await updateDoc(
              doc(collection(db, "rooms", "xxx", "actions"), "xxx"),
              {}
            )
          }}
        >
          Update action
        </button>
      </p>
    </div>
  )
}
