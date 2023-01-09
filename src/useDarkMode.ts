import { distinctUntilChanged, map, Observable } from "rxjs"
import { createContext } from "./createContext"
import { observeMediaQuery } from "./observeMediaQuery"

export const [keyWithDarkMode, useDarkMode] =
  createContext<Observable<"dark" | "light">>("DarkModeProvider")

export function observeDarkMode(): Observable<"dark" | "light"> {
  return observeMediaQuery(
    window.matchMedia("(prefers-color-scheme: dark)")
  ).pipe(
    map((_) => (_.matches ? "dark" : "light")),
    distinctUntilChanged()
  )
}
