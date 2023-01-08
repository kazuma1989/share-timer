<script lang="ts">
  import clsx from "clsx"
  import qrcode from "qrcode-generator"

  export let data: string
  export let width: number
  export let height: number

  let className: string = ""
  export { className as class }

  const { size, d } = qrToSVG(data)

  function qrToSVG(data: string): {
    size: number
    d: string
  } {
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
</script>

<svg
  class={clsx("bg-white text-black", className)}
  viewBox={`0 0 ${size} ${size}`}
  {width}
  {height}
>
  <path stroke="transparent" fill="currentColor" {d} />
</svg>
