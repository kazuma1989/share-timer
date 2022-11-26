import clsx from "clsx"
import { Ref, useImperativeHandle, useRef, useState } from "react"
import { parseDuration } from "./util/parseDuration"

export function DurationSelect({
  innerRef,
  defaultValue = 0,
  className,
}: {
  innerRef?: Ref<{ value: number }>
  defaultValue?: number
  className?: string
}) {
  const defaultDuration = parseDuration(defaultValue)
  const duration$ = useRef(defaultDuration)

  useImperativeHandle(
    innerRef,
    () => ({
      get value() {
        const { hours, minutes, seconds } = duration$.current
        return hours * 3600_000 + minutes * 60_000 + seconds * 1_000
      },
    }),
    []
  )

  const [io, setIO] = useState<IntersectionObserver>()

  const selectStyle = clsx(
    "cursor-pointer appearance-none rounded-md p-2 transition-colors",
    "bg-light hover:bg-dark/10 dark:bg-dark dark:hover:bg-light/20"
  )

  const selectStyle2 = clsx(
    "cursor-pointer rounded-md px-4 transition-colors",
    "bg-light hover:bg-dark/10 dark:bg-dark dark:hover:bg-light/20",
    "scrollbar-hidden inline-flex flex-col overflow-y-scroll overscroll-contain snap-y snap-mandatory [&>*]:snap-center",
    "h-[68px] [&>:first-child]:pt-4 [&>:last-child]:pb-4"
  )

  return (
    <span className={clsx("inline-flex gap-4 text-3xl", className)}>
      <span>
        <span
          ref={(root) => {
            if (!root) return

            setIO((io) => {
              if (io?.root && io.root === root) {
                return io
              }

              io?.disconnect()

              return new IntersectionObserver(
                (entries) => {
                  const [e] = entries
                    .filter(
                      (
                        _
                      ): _ is Omit<IntersectionObserverEntry, "target"> & {
                        target: HTMLElement
                      } => _.isIntersecting && _.target instanceof HTMLElement
                    )
                    .map((_) => _.target)
                  if (!e) return

                  duration$.current.hours = Number(e.dataset.value)
                },
                {
                  root,
                  threshold: 1,
                }
              )
            })
          }}
          className={selectStyle2}
        >
          {Array.from(Array(24).keys()).map((i) => (
            <span
              data-value={i}
              key={i}
              ref={(e) => {
                if (!e) return

                io?.observe(e)
              }}
            >
              {i.toString(10).padStart(2, "0")}
            </span>
          ))}
        </span>
        &nbsp;時間
      </span>

      <span>
        <select
          defaultValue={defaultDuration.minutes}
          className={selectStyle}
          onChange={(e) => {
            duration$.current.minutes = Number(e.currentTarget.value)
          }}
        >
          {Array.from(Array(60).keys()).map((i) => (
            <option key={i} value={i}>
              {i.toString(10).padStart(2, "0")}
            </option>
          ))}
        </select>
        &nbsp;分
      </span>

      <span>
        <select
          defaultValue={defaultDuration.seconds}
          className={selectStyle}
          onChange={(e) => {
            duration$.current.seconds = Number(e.currentTarget.value)
          }}
        >
          {Array.from(Array(60).keys()).map((i) => (
            <option key={i} value={i}>
              {i.toString(10).padStart(2, "0")}
            </option>
          ))}
        </select>
        &nbsp;秒
      </span>
    </span>
  )
}
