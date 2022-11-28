import clsx from "clsx"
import { useObservable } from "./useObservable"
import { createCache } from "./util/createCache"

export function QRCode({
  data,
  className,
  ...props
}: { data: string } & JSX.IntrinsicElements["svg"]) {
  const qr$ = hardCache(data, () => qrcode(data))
  const { size, d } = useObservable(qr$)

  return (
    <svg
      className={clsx("bg-white text-black", className)}
      viewBox={`0 0 ${size} ${size}`}
      {...props}
    >
      <path stroke="transparent" fill="currentColor" d={d} />
    </svg>
  )
}

const hardCache = createCache(true)

async function qrcode(data: string): Promise<{
  size: number
  d: string
}> {
  const { default: qrcode } = await import("qrcode-generator")

  const typeAuto = 0
  const qr = qrcode(typeAuto, "M")
  qr.addData(data)
  qr.make()

  const count = qr.getModuleCount()
  const margin = 1

  const size = margin + count + margin

  let d = ""
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (qr.isDark(row, col)) {
        d += `M${margin + col},${margin + row}l1,0 0,1 -1,0 0,-1z `
      }
    }
  }

  return {
    size,
    d,
  }
}
