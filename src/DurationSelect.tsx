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

  const wrapperStyle = clsx(
    "after:content-[attr(data-label)] after:pointer-events-none after:text-lg after:inline-block",
    "after:w-12 after:pr-2 after:text-right"
  )

  const selectStyle = clsx(
    "cursor-pointer rounded-md transition-colors",
    "hover:bg-dark/10 dark:hover:bg-light/20",
    "text-3xl pr-14 -mr-12"
  )

  return (
    <span className={clsx("inline-flex gap-2", className)}>
      <span className={wrapperStyle} data-label="時間">
        <Select
          defaultValue={defaultDuration.hours}
          length={24}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.hours = Number(value)
          }}
        />
      </span>

      <span className={wrapperStyle} data-label="分">
        <Select
          defaultValue={defaultDuration.minutes}
          length={60}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.minutes = Number(value)
          }}
        />
      </span>

      <span className={wrapperStyle} data-label="秒">
        <Select
          defaultValue={defaultDuration.seconds}
          length={60}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.seconds = Number(value)
          }}
        />
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

  const [currentValue, setCurrentValue] = useState<number>()

  return (
    <span
      ref={(root) => {
        if (!root) return

        createObserver(
          root,
          (e) => {
            setCurrentValue(Number(e.dataset.value))

            onChange?.(e.dataset.value)
          },
          {
            rootMargin: "-8px 0px",
          }
        )
      }}
      className={clsx(
        "scrollbar-hidden inline-flex flex-col overflow-y-scroll overscroll-contain snap-y snap-mandatory [&>*]:snap-center",
        "px-4 h-[calc(36px+3rem)] [&>:first-child]:mt-6 [&>:last-child]:mb-6",
        className
      )}
    >
      {Array.from(Array(length).keys()).map((value) => (
        <span
          data-value={value}
          aria-selected={value === currentValue ? "true" : undefined}
          className="aria-selected:opacity-100 opacity-25"
          key={value}
          ref={(e) => {
            if (!e) return

            observer?.observe(e)

            if (value === defaultValue && !scrollCalled$.current) {
              e.scrollIntoView({ block: "center" })

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
    onIntersecting?: (...targets: [HTMLElement, ...HTMLElement[]]) => void,
    options?: IntersectionObserverInit
  ) => void
] {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  return [
    observer,
    (root, onIntersecting, options) => {
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
            threshold: 1,
            root,
            ...options,
          }
        )
      })
    },
  ]
}
