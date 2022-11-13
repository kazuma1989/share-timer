import { scan, startWith, Subject } from "rxjs"
import { shareRecent } from "./util/shareRecent"

interface Config {
  flash: "on" | "off"
  sound: "on" | "off"
}

export const configDispatch$ = new Subject<Partial<Config>>()

export const config$ = configDispatch$.pipe(
  startWith({}),
  scan((acc: Config, value): Config => ({ ...acc, ...value }), {
    flash: "on",
    sound: "on",
  }),
  shareRecent()
)
