import clsx from "clsx"

export function DurationSelect() {
  const selectStyle = clsx(
    "appearance-none rounded-none border-b border-white bg-transparent px-2"
  )

  return (
    <span className="inline-flex gap-4 text-3xl">
      <span>
        <select className={selectStyle}>
          {Array.from(Array(24).keys()).map((i) => (
            <option key={i} value={i}>
              {i.toString(10).padStart(2, "0")}
            </option>
          ))}
        </select>
        &nbsp;時間
      </span>

      <span>
        <select className={selectStyle}>
          {Array.from(Array(60).keys()).map((i) => (
            <option key={i} value={i}>
              {i.toString(10).padStart(2, "0")}
            </option>
          ))}
        </select>
        &nbsp;分
      </span>

      <span>
        <select className={selectStyle}>
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
