import { scan, startWith, Subject } from "rxjs"
import { shareRecent } from "./util/shareRecent"

interface Config {
  flash: "on" | "off"
  sound: "on" | "off"
}

type ConfigKey = keyof Config

export function toggleConfig(key: ConfigKey): void {
  configDispatch$.next(key)
}

const configDispatch$ = new Subject<ConfigKey>()

export const config$ = configDispatch$.pipe(
  startWith(null),
  scan(
    (acc: Config, key): Config => {
      if (!key) {
        return acc
      }

      return {
        ...acc,
        [key]: acc[key] === "on" ? "off" : "on",
      }
    },
    {
      flash: "on",
      sound: "on",
    }
  ),
  shareRecent()
)
