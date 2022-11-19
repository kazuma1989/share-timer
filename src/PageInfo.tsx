import clsx from "clsx"
import { doc, runTransaction } from "firebase/firestore"
import { collection } from "./firestore/collection"
import { useFirestore } from "./firestore/useFirestore"
import { icon } from "./icon"
import { setHash } from "./observeHash"
import { getItem } from "./storage"
import { fromRoute } from "./toRoute"
import { TransparentButton } from "./TransparentButton"
import { Room, RoomOnFirestore, roomZod } from "./zod/roomZod"

export function PageInfo({ roomId }: { roomId: Room["id"] }) {
  const db = useFirestore()

  const roomURL =
    location.origin + location.pathname + `#${fromRoute(["room", roomId])}`

  return (
    <article
      className={clsx(
        "max-w-prose mx-auto h-screen",
        "text-dark/90 dark:text-light/90",
        "prose prose-headings:text-dark/70 prose-a:text-azure-700 dark:prose-headings:text-light/70 dark:prose-a:text-azure-300",
        "grid grid-rows-[1fr_auto]",
        "px-6"
      )}
    >
      <div>
        <TransparentButton
          title="戻る"
          className="h-12 w-12 text-2xl -ml-4 my-2"
          onClick={() => {
            setHash(["room", roomId])
          }}
        >
          {icon("arrow-left")}
        </TransparentButton>

        <h1>
          <ruby>
            Share Timer <rp>(</rp>
            <rt className="text-xs">シェア タイマー</rt>
            <rp>)</rp>
          </ruby>
        </h1>

        <p>URL でタイマーを簡単共有！</p>

        <p>
          このタイマーの URL
          <br />
          <a href={roomURL} className="break-words">
            {roomURL}
          </a>
        </p>

        <p>※ タイマーは誰でも開始／一時停止／キャンセルできます</p>

        <p>
          <a
            href="#"
            target="_blank"
            className={clsx(
              "border border-gray-500 block px-4 py-3 text-center no-underline after:content-['_↗']",
              // FIXME TransparentButtonと同じスタイルなのでなんとかコンポーネントにまとめられないか
              "cursor-pointer rounded-md transition-colors",
              "hover:bg-dark/10 active:bg-dark/20 dark:hover:bg-light/20 dark:active:bg-light/30"
            )}
          >
            新しいタイマーを開く
          </a>
        </p>

        <p>
          <TransparentButton
            className={clsx("w-full border border-gray-500 block px-4 py-3")}
            onClick={async () => {
              const userId = getItem("userId")
              if (!userId) return

              const abort = new AbortController()

              type AbortReason =
                | "signal"
                | "room-not-exists"
                | "already-locked"
                | "user-deny"
              const AbortReason = (_: AbortReason) => _

              await runTransaction(
                db,
                async (transaction) => {
                  const roomDoc = await transaction.get(
                    doc(collection(db, "rooms"), roomId)
                  )
                  if (abort.signal.aborted) {
                    throw AbortReason("signal")
                  }

                  if (!roomDoc.exists()) {
                    throw AbortReason("room-not-exists")
                  }

                  const room = roomZod.parse(roomDoc.data())
                  if (room.lockedBy) {
                    throw AbortReason("already-locked")
                  }

                  const confirmed = confirm(
                    "解除の方法はありませんが、本当にロックしますか？"
                  )
                  if (!confirmed) {
                    throw AbortReason("user-deny")
                  }

                  transaction.update<RoomOnFirestore>(roomDoc.ref, {
                    lockedBy: userId,
                  })
                },
                {
                  maxAttempts: 1,
                }
              ).catch((reason: AbortReason) => {
                switch (reason) {
                  case "already-locked": {
                    alert("already locked by another user")
                    break
                  }

                  case "user-deny": {
                    break
                  }

                  default: {
                    throw reason
                  }
                }
              })
            }}
          >
            編集をロックする (experimental)
          </TransparentButton>
        </p>
      </div>

      <footer>
        <p className="text-center">
          <small>
            Crafted by{" "}
            <a
              href="https://github.com/kazuma1989"
              target="_blank"
              rel="noopener noreferrer"
            >
              @kazuma1989
            </a>
          </small>
        </p>
      </footer>
    </article>
  )
}
