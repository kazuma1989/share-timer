<script lang="ts">
  export let label: string = ""
  export let value: number = 0
  export let valueMax: number = 0

  let className: string = ""
  export { className as class }

  // TODO valueNow の役割ってなんだっけ
  $: valueNow = value
</script>

<span
  role="slider"
  aria-label={`${label}選択`}
  aria-orientation="vertical"
  aria-valuemin={0}
  aria-valuemax={valueMax}
  aria-valuenow={valueNow}
  aria-valuetext={valueNow === undefined ? undefined : `${valueNow}${label}`}
  tabindex="0"
  class={className}
  on:keydown={(e) => {
    import.meta.env.DEV && console.debug(e.key, e.keyCode)

    switch (e.key) {
      case "ArrowUp":
      case "ArrowRight": {
        e.preventDefault()

        // increment
        value += 1
        // const next = currentOption$.current?.nextElementSibling
        // next?.scrollIntoView({ block: "center" })
        break
      }

      case "ArrowDown":
      case "ArrowLeft": {
        e.preventDefault()

        // decrement
        value -= 1
        // const prev = currentOption$.current?.previousElementSibling
        // prev?.scrollIntoView({ block: "center" })
        break
      }
    }
  }}
>
  {value}{label}
</span>
