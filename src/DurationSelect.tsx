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
          label="時間"
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
          label="分"
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
          label="秒"
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
  label,
  defaultValue,
  length,
  onChange,
  className,
}: {
  label?: string
  defaultValue?: number
  length?: number
  onChange?(value: number): void
  className?: string
}) {
  const onChange$ = useRef(onChange)
  onChange$.current = onChange

  const [valuenow, setValuenow] = useState<number>()

  const currentOption$ = useRef<HTMLElement>()

  const [observer, createObserver] = useObserver()

  const defaultValueUsed$ = useRef(false)

  return (
    <span
      role="slider"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={(length || 1) - 1}
      aria-valuenow={valuenow}
      aria-valuetext={
        valuenow === undefined ? undefined : `${valuenow}${label ?? ""}`
      }
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
            currentOption$.current = option

            const value = Number(option.dataset.value)

            setValuenow(value)
            onChange$.current?.(value)
          },
          options: {
            rootMargin: "-32px 0px",
          },
        })
      }}
      onKeyDown={(e) => {
        import.meta.env.DEV && console.debug(e.key, e.keyCode)

        switch (e.key) {
          case "ArrowUp":
          case "ArrowRight": {
            e.preventDefault()

            // increment
            const next = currentOption$.current?.nextElementSibling
            next?.scrollIntoView({ block: "center" })
            break
          }

          case "ArrowDown":
          case "ArrowLeft": {
            e.preventDefault()

            // decrement
            const prev = currentOption$.current?.previousElementSibling
            prev?.scrollIntoView({ block: "center" })
            break
          }
        }
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

            if (value === defaultValue && !defaultValueUsed$.current) {
              option.scrollIntoView({ block: "center" })

              defaultValueUsed$.current = true
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
