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
    "appearance-none rounded-none border-b border-current bg-light px-2 dark:bg-dark"
  )

  return (
    <span className={clsx("inline-flex gap-4 text-3xl", className)}>
      <span>
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
