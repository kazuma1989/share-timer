import { Observable, scan, startWith, Subject } from "rxjs"
import { shareRecent } from "../util/shareRecent"

interface Config {
  flash: "on" | "off"
  sound: "on" | "off"
}

type ConfigKey = keyof Config

export function useConfig(): Observable<Config> {
  return config$
}

export function toggleConfig(key: ConfigKey): void {
  configDispatch$.next(key)
}

const configDispatch$ = new Subject<ConfigKey>()

const initialConfig: Config = {
  flash: "on",
  sound: "on",
}

const config$ = configDispatch$.pipe(
  scan(
    (acc, key) => ({
      ...acc,
      [key]: acc[key] === "on" ? "off" : "on",
    }),
    initialConfig
  ),
  startWith(initialConfig),
  shareRecent(false)
)
