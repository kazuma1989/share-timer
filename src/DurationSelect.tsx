import clsx from "clsx"
import {
  Ref,
  useEffect,
  useImperativeHandle,
  useReducer,
  useRef,
  useState,
} from "react"
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
    "select-none cursor-pointer rounded-md transition-colors",
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
            duration$.current.hours = value
          }}
        />
      </span>

      <span className={wrapperStyle} data-label="分">
        <Select
          defaultValue={defaultDuration.minutes}
          length={60}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.minutes = value
          }}
        />
      </span>

      <span className={wrapperStyle} data-label="秒">
        <Select
          defaultValue={defaultDuration.seconds}
          length={60}
          className={selectStyle}
          onChange={(value) => {
            duration$.current.seconds = value
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
  onChange?(value: number): void
  className?: string
}) {
  const onChange$ = useRef(onChange)
  onChange$.current = onChange

  const [valuenow, setValuenow] = useState<number>()

  const [observer, createObserver] = useObserver()

  const scrollCalled$ = useRef(false)

  return (
    <span
      role="slider"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={(length || 1) - 1}
      aria-valuenow={valuenow}
      tabIndex={1}
      className={clsx(
        "scrollbar-hidden inline-flex flex-col overflow-y-scroll overscroll-contain snap-y snap-mandatory [&>*]:snap-center",
        "px-4 h-[calc(36px+6rem)] [&>:first-child]:mt-12 [&>:last-child]:mb-12",
        className
      )}
      ref={(listbox) => {
        if (!listbox) return

        createObserver({
          root: listbox,
          onIntersecting(option) {
            const value = Number(option.dataset.value)

            setValuenow(value)
            onChange$.current?.(value)
          },
          options: {
            rootMargin: "-32px 0px",
          },
        })
      }}
    >
      {Array.from(Array(length).keys()).map((value) => (
        <span
          key={value}
          data-value={value}
          className={clsx(
            "text-right",
            value !== valuenow && "opacity-25 font-thin"
          )}
          ref={(option) => {
            if (!option) return

            observer?.observe(option)

            if (value === defaultValue && !scrollCalled$.current) {
              option.scrollIntoView({ block: "center" })

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

interface Init {
  root: HTMLElement
  onIntersecting?: (...targets: [HTMLElement, ...HTMLElement[]]) => void
  options?: IntersectionObserverInit
}

function useObserver(): [
  observer: IntersectionObserver | null,
  createObserver: (init: Init) => void
] {
  const [init, setInit] = useReducer(
    (prev: Init | null, next: Init): Init | null =>
      prev && prev.root === next.root ? prev : next,
    null
  )

  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!init) return

    const { root, onIntersecting, options } = init

    const observer = new IntersectionObserver(
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
        ...options,
        root,
      }
    )

    setObserver(observer)

    return () => {
      observer.disconnect()
    }
  }, [init])

  return [observer, setInit]
}
