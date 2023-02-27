import { parseDuration } from "./parseDuration"

export function humanReadableLabelOf(duration: number): string {
  const { hours, minutes, seconds } = parseDuration(Math.abs(duration))

  return [
    duration >= 0 ? "" : "マイナス",
    hours ? `${hours}時間` : "",
    minutes ? `${minutes}分` : "",
    seconds ? `${seconds}秒` : "",
  ].join("")
}
