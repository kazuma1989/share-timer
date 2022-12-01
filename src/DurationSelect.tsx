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

  return (
    <span className={clsx("inline-flex gap-2", className)}>
      <Slider
        label="時間"
        defaultValue={defaultDuration.hours}
        valueMax={23}
        onChange={(value) => {
          duration$.current.hours = value
        }}
      />

      <Slider
        label="分"
        defaultValue={defaultDuration.minutes}
        valueMax={59}
        onChange={(value) => {
          duration$.current.minutes = value
        }}
      />

      <Slider
        label="秒"
        defaultValue={defaultDuration.seconds}
        valueMax={59}
        onChange={(value) => {
          duration$.current.seconds = value
        }}
      />
    </span>
  )
}

function Slider({
  label = "",
  defaultValue,
  valueMax = 0,
  onChange,
  className,
}: {
  label?: string
  defaultValue?: number
  valueMax?: number
  onChange?(value: number): void
  className?: string
}) {
  const onChange$ = useRef(onChange)
  onChange$.current = onChange

  const [valueNow, setValueNow] = useState<number>()

  const currentOption$ = useRef<HTMLElement>()

  const [observer, createObserver] = useObserver()

  const defaultValueUsed$ = useRef(false)

  return (
    <span
      className="after:content-[attr(data-label)] after:pointer-events-none after:text-lg after:inline-block after:w-12 after:pr-2 after:text-right"
      data-label={label}
    >
      <span
        role="slider"
        aria-orientation="vertical"
        aria-valuemin={0}
        aria-valuemax={valueMax}
        aria-valuenow={valueNow}
        aria-valuetext={
          valueNow === undefined ? undefined : `${valueNow}${label}`
        }
        tabIndex={1}
        className={clsx(
          "scrollbar-hidden inline-flex flex-col overflow-y-scroll overscroll-contain snap-y snap-mandatory [&>*]:snap-center",
          "px-4 h-[calc(36px+6rem)] [&>:first-child]:mt-12 [&>:last-child]:mb-12",
          "select-none cursor-pointer rounded-md transition-colors",
          "hover:bg-dark/10 dark:hover:bg-light/20",
          "text-3xl pr-14 -mr-12",
          className
        )}
        ref={(slider) => {
          if (!slider) return

          createObserver({
            root: slider,
            onIntersecting(option) {
              currentOption$.current = option

              const value = Number(option.dataset.value)

              setValueNow(value)
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
        {Array.from(Array(valueMax + 1).keys()).map((value) => (
          <span
            key={value}
            data-value={value}
            className={clsx(
              "text-right",
              value !== valueNow && "opacity-25 font-thin"
            )}
            ref={(step) => {
              if (!step) return

              observer?.observe(step)

              if (value === defaultValue && !defaultValueUsed$.current) {
                step.scrollIntoView({ block: "center" })

                defaultValueUsed$.current = true
              }
            }}
          >
            {value.toString(10).padStart(2, "0")}
          </span>
        ))}
      </span>
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
