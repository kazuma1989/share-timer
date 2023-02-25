<script lang="ts">
  import { browser } from "$app/environment"
  import { Observable, of, switchMap } from "rxjs"
  import { readable, type Readable } from "svelte/store"
  import { observeDarkMode } from "../../useDarkMode"

  type X<T> = T extends Readable<infer R> ? R : never

  const browser$ = readable(browser, (set) => {
    set(browser)
  })

  const x$ = new Observable<X<typeof browser$>>((subscriber) => {
    browser$.subscribe((_) => {
      subscriber.next(_)
    })
  })

  const y$ = x$.pipe(
    switchMap((browser) => (browser ? observeDarkMode() : of("light" as const)))
  )

  y$.subscribe((_) => {
    console.log(_)
  })

  browser$.subscribe((value) => {
    console.log({ value })
  })

  console.log({
    browser,
  })
</script>

{#if $browser$}
  <h1>BROWSER YES</h1>
{:else}
  <h1>NODE_JS</h1>
{/if}
