import clsx from "clsx"
import { Ref, useImperativeHandle, useRef } from "react"
import { icon } from "./icon"
import { TransparentButton } from "./TransparentButton"

export function InformationDialog({
  className,
  innerRef,
  ...props
}: JSX.IntrinsicElements["dialog"] & {
  ref?: "should use innerRef"
  innerRef?: Ref<HTMLDialogElement | null>
}) {
  const dialog$ = useRef<HTMLDialogElement>(null)
  useImperativeHandle(innerRef, () => dialog$.current, [])

  return (
    <dialog
      ref={dialog$}
      className={clsx(
        "h-full container top-[3vh] max-h-[calc(100%-3vh)] overscroll-contain rounded-t-lg border border-b-0 max-w-prose",
        "border-neutral-300 bg-light text-inherit dark:border-neutral-700 dark:bg-dark",
        "open:shadow-screen open:shadow-dark/10 dark:open:shadow-light/20",
        "transition-[box-shadow,transform,visibility] duration-300 [&:not([open])]:translate-y-full",
        // override default dialog style
        "fixed p-0 backdrop:bg-transparent open:visible [&:not([open])]:invisible [&:not([open])]:block",
        className
      )}
      onClick={() => {
        dialog$.current?.close()
      }}
      {...props}
    >
      <div className="flex justify-end">
        <TransparentButton
          title="閉じる"
          className="h-12 w-12 text-2xl fixed m-2"
        >
          {icon("close")}
        </TransparentButton>
      </div>

      <article
        className={clsx(
          "min-h-full min-w-full",
          "text-dark/90 dark:text-light/90 prose prose-headings:text-dark/70 prose-a:text-azure-700 dark:prose-headings:text-light/70 dark:prose-a:text-azure-300",
          "grid grid-rows-[1fr_auto]",
          "pt-12 px-6"
        )}
        onClick={(e) => {
          e.stopPropagation()
        }}
      >
        <div>
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
            <a href={location.href} className="break-words">
              {/* FIXME location.href だとリアクティブにならない気がする？ */}
              {location.href}
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
    </dialog>
  )
}