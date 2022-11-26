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

  const [hoursObserver, createHoursObserver] = useObserver()
  const [minutesObserver, createMinutesObserver] = useObserver()
  const [secondsObserver, createSecondsObserver] = useObserver()

  const selectStyle = clsx(
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

            createHoursObserver(root, (e) => {
              duration$.current.hours = Number(e.dataset.value)
            })
          }}
          className={selectStyle}
        >
          {Array.from(Array(24).keys()).map((i) => (
            <span
              data-value={i}
              key={i}
              ref={(e) => {
                if (!e) return

                hoursObserver?.observe(e)
              }}
            >
              {i.toString(10).padStart(2, "0")}
            </span>
          ))}
        </span>
        &nbsp;時間
      </span>

      <span>
        <span
          ref={(root) => {
            if (!root) return

            createMinutesObserver(root, (e) => {
              duration$.current.minutes = Number(e.dataset.value)
            })
          }}
          className={selectStyle}
        >
          {Array.from(Array(60).keys()).map((i) => (
            <span
              data-value={i}
              key={i}
              ref={(e) => {
                if (!e) return

                minutesObserver?.observe(e)
              }}
            >
              {i.toString(10).padStart(2, "0")}
            </span>
          ))}
        </span>
        &nbsp;分
      </span>

      <span>
        <span
          ref={(root) => {
            if (!root) return

            createSecondsObserver(root, (e) => {
              duration$.current.seconds = Number(e.dataset.value)
            })
          }}
          className={selectStyle}
        >
          {Array.from(Array(60).keys()).map((i) => (
            <span
              data-value={i}
              key={i}
              ref={(e) => {
                if (!e) return

                secondsObserver?.observe(e)
              }}
            >
              {i.toString(10).padStart(2, "0")}
            </span>
          ))}
        </span>
        &nbsp;秒
      </span>
    </span>
  )
}

function useObserver(): [
  observer: IntersectionObserver | null,
  createObserver: (
    root: HTMLElement,
    onIntersecting?: (...targets: [HTMLElement, ...HTMLElement[]]) => void
  ) => void
] {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  return [
    observer,
    (root, onIntersecting) => {
      setObserver((io) => {
        if (io?.root && io.root === root) {
          return io
        }

        io?.disconnect()

        return new IntersectionObserver(
          (entries) => {
            const [target, ...targets] = entries
              .filter(
                (
                  _
                ): _ is Omit<IntersectionObserverEntry, "target"> & {
                  target: HTMLElement
                } => _.isIntersecting && _.target instanceof HTMLElement
              )
              .map((_) => _.target)

            if (target) {
              onIntersecting?.(target, ...targets)
            }
          },
          {
            root,
            threshold: 1,
          }
        )
      })
    },
  ]
}
