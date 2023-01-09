export function getId(): string {
  return `id_${index$.next().value}:`
}

const index$ = (function* () {
  for (let i = 0; ; i++) {
    yield i
  }
})()
