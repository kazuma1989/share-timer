import { browser } from "$app/environment"
import { of, type Observable } from "rxjs"

export function ifBrowser<T>(
  getter: () => Observable<T>,
  elseValue: T
): Observable<T> {
  return browser ? getter() : of(elseValue)
}
