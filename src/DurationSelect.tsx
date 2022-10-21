import clsx from "clsx"
import { useRef } from "react"
import { parseDuration } from "./parseDuration"

export function DurationSelect({
  defaultValue = 0,
  onChange,
  className,
}: {
  defaultValue?: number
  onChange?(value: number): void
  className?: string
}) {
  const defaultDuration = parseDuration(defaultValue)
  const duration$ = useRef(defaultDuration)

  const notifyChange = () => {
    const { hours, minutes, seconds } = duration$.current
    onChange?.(hours * 3600_000 + minutes * 60_000 + seconds * 1_000)
  }

  const selectStyle = clsx(
    "appearance-none rounded-none border-b border-white bg-transparent px-2"
  )

  return (
    <span className={clsx("inline-flex gap-4 text-3xl", className)}>
      <span>
        <select
          defaultValue={defaultDuration.hours}
          className={selectStyle}
          onChange={(e) => {
            duration$.current.hours = Number(e.currentTarget.value)
            notifyChange()
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
            notifyChange()
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
            notifyChange()
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
