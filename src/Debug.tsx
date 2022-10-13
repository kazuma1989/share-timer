/* eslint-disable no-console */
import {
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore"
import { collection } from "./collection"
import { useAllSettled } from "./useAllSettled"
import { useFirestore } from "./useFirestore"

export function Debug() {
  const db = useFirestore()

  const [allSettled, add] = useAllSettled()

  return (
    <div>
      <p>
        {allSettled ? "settled" : "pending"}

        <button
          type="button"
          onClick={() => {
            add(
              new Promise<void>((resolve) => {
                setTimeout(() => {
                  console.count("resolve")
                  resolve()
                }, 1_000)
              })
            )
          }}
        >
          Promiseをloading stateに使う実験
        </button>
      </p>

      <p>
        <button
          type="button"
          onClick={async () => {
            const roomRef = doc(collection(db, "rooms"), "jzl9G0aZOVAkoBqsFza1")

            await Promise.all([
              wait(500).then(async () => {
                await updateDoc(roomRef, {
                  lastEditDone: serverTimestamp(),
                  name: "A",
                })
              }),

              runTransaction(
                db,
                async (transaction) => {
                  console.count("runTransaction")

                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const room = await transaction.get(roomRef)
                  // if (!room.exists()) {
                  //   throw "Document does not exist!"
                  // }

                  await wait(750)

                  transaction.update(roomRef, {
                    lastEditDone: serverTimestamp(),
                    name: "B",
                  })
                },
                {
                  maxAttempts: 1,
                }
              ),
            ])

            console.countReset("runTransaction")
          }}
        >
          トランザクション実験
        </button>
      </p>

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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
