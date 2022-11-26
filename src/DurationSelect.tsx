import clsx from "clsx"
import { Ref, useImperativeHandle, useRef } from "react"
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
    "cursor-pointer appearance-none rounded-md p-2 transition-colors",
    "bg-light hover:bg-dark/10 dark:bg-dark dark:hover:bg-light/20"
  )

  const selectStyle2 = clsx(
    "cursor-pointer rounded-md [&>*]:p-4 transition-colors",
    "bg-light hover:bg-dark/10 dark:bg-dark dark:hover:bg-light/20",
    "scrollbar-hidden h-[68px] inline-flex flex-col overflow-y-scroll overscroll-contain snap-y snap-mandatory [&>*]:snap-start"
  )

  return (
    <span className={clsx("inline-flex gap-4 text-3xl", className)}>
      <span>
        <span className={selectStyle2}>
          {Array.from(Array(24).keys()).map((i) => (
            <span key={i}>{i.toString(10).padStart(2, "0")}</span>
          ))}
        </span>
        <select
          defaultValue={defaultDuration.hours}
          className={selectStyle}
          onChange={(e) => {
            duration$.current.hours = Number(e.currentTarget.value)
          }}
        >
          {Array.from(Array(24).keys()).map((i) => (
            <option key={i} value={i}>
              {i.toString(10).padStart(2, "0")}
            </option>
          ))}
        </select>
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
