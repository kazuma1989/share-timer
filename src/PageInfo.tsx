import clsx from "clsx"
import { icon } from "./icon"
import { setHash } from "./observeHash"
import { QRCode } from "./QRCode"
import { getItem } from "./storage"
import { fromRoute } from "./toRoute"
import { TransparentButton } from "./TransparentButton"
import { AbortReason, useLockRoom } from "./useLockRoom"
import { Room } from "./zod/roomZod"

export function PageInfo({ roomId }: { roomId: Room["id"] }) {
  const roomURL =
    location.origin + location.pathname + `#${fromRoute(["room", roomId])}`

  const lockRoom = useLockRoom()

  return (
    <article
      className={clsx(
        "mx-auto h-screen max-w-prose",
        "text-dark/90 dark:text-light/90",
        "prose prose-headings:text-dark/70 prose-a:text-azure-700 dark:prose-headings:text-light/70 dark:prose-a:text-azure-300",
        "grid grid-rows-[1fr_auto]",
        "px-6"
      )}
    >
      <div>
        <TransparentButton
          title="戻る"
          className="my-2 -ml-4 h-12 w-12 text-2xl"
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

        <p className="text-center">
          <a href={roomURL} className="break-words">
            <QRCode
              data={roomURL}
              width={160}
              height={160}
              className="mb-2 inline-block"
            />
            <br />

            <span>{roomURL}</span>
          </a>
        </p>

        <p>
          <span className="before:content-['※_']">
            タイマーは誰でも開始／一時停止／キャンセルできます
          </span>
          <br />
          <span className="before:content-['※_']">
            カウントダウン中の数字部分をダブルタップすると…？
          </span>
        </p>

        <p>
          <a
            href="#"
            target="_blank"
            className={clsx(
              "block border border-gray-500 px-4 py-3 text-center no-underline after:content-['_↗']",
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
            className="block w-full border border-gray-500 px-4 py-3"
            onClick={async () => {
              const userId = getItem("userId")
              if (!userId) return

              const abort = new AbortController()

              await lockRoom(roomId, userId, {
                signal: abort.signal,
                onBeforeUpdate() {
                  const confirmed = confirm(
                    "解除の方法はありませんが、本当にロックしますか？"
                  )
                  if (!confirmed) {
                    throw AbortReason("user-deny")
                  }
                },
              }).catch((reason: AbortReason) => {
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
