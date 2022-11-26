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

  const selectStyle = clsx(
    "cursor-pointer rounded-md transition-colors",
    "bg-light hover:bg-dark/10 dark:bg-dark dark:hover:bg-light/20"
  )

  return (
    <span className={clsx("inline-flex gap-4 text-3xl", className)}>
      <span>
        <Select
          defaultValue={defaultDuration.hours}
          length={24}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.hours = Number(value)
          }}
        />
        &nbsp;時間
      </span>

      <span>
        <Select
          defaultValue={defaultDuration.minutes}
          length={60}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.minutes = Number(value)
          }}
        />
        &nbsp;分
      </span>

      <span>
        <Select
          defaultValue={defaultDuration.seconds}
          length={60}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.seconds = Number(value)
          }}
        />
        &nbsp;秒
      </span>
    </span>
  )
}

function Select({
  defaultValue,
  length,
  onChange,
  className,
}: {
  defaultValue?: number
  length?: number
  onChange?(value: string | undefined): void
  className?: string
}) {
  const [observer, createObserver] = useObserver()

  const scrollCalled$ = useRef(false)

  return (
    <span
      ref={(root) => {
        if (!root) return

        createObserver(root, (e) => {
          onChange?.(e.dataset.value)
        })
      }}
      className={clsx(
        "scrollbar-hidden inline-flex flex-col overflow-y-scroll overscroll-contain snap-y snap-mandatory [&>*]:snap-center",
        "px-4 h-[68px] [&>:first-child]:pt-4 [&>:last-child]:pb-4",
        className
      )}
    >
      {Array.from(Array(length).keys()).map((value) => (
        <span
          data-value={value}
          key={value}
          ref={(e) => {
            if (!e) return

            observer?.observe(e)

            if (value === defaultValue && !scrollCalled$.current) {
              e.scrollIntoView()

              scrollCalled$.current = true
            }
          }}
        >
          {value.toString(10).padStart(2, "0")}
        </span>
      ))}
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
