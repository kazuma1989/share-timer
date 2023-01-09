<script lang="ts">
  export let label: string = ""
  export let defaultValue: number | undefined = undefined
  export let valueMax: number = 0
  export let onChange: ((value: number) => void) | undefined = undefined

  let className: string = ""
  export { className as class }

  let valueNow = 0
</script>

<span
  role="slider"
  aria-label={`${label}選択`}
  aria-orientation="vertical"
  aria-valuemin={0}
  aria-valuemax={valueMax}
  aria-valuenow={valueNow}
  aria-valuetext={valueNow === undefined ? undefined : `${valueNow}${label}`}
  tabIndex={0}
>
  {defaultValue}{label}
</span>
