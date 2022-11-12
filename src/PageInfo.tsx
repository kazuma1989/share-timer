import clsx from "clsx"
import { icon } from "./icon"
import { setHash } from "./observeHash"
import { TransparentButton } from "./TransparentButton"
import { Room } from "./zod/roomZod"

export function PageInfo({ roomId }: { roomId: Room["id"] }) {
  const roomURL = location.origin + location.pathname + `#${roomId}`

  return (
    <article
      className={clsx(
        "container mx-auto h-screen",
        "text-dark/90 dark:text-light/90 prose prose-headings:text-dark/70 prose-a:text-azure-700 dark:prose-headings:text-light/70 dark:prose-a:text-azure-300",
        "grid grid-rows-[1fr_auto]",
        "px-6"
      )}
    >
      <div>
        <TransparentButton
          title="戻る"
          className="h-12 w-12 text-2xl -ml-4 my-2"
          onClick={() => {
            setHash(roomId)
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
