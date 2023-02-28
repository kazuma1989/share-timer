import type { FirebaseOptions } from "firebase/app"
import type { LayoutServerLoad } from "./$types"
import { installPolyfills } from "./installPolyfills"

installPolyfills()

export const load = (async ({ fetch }) => {
  const options: FirebaseOptions = await fetch(
    `https://${
      import.meta.env.FIREBASE_PROJECTS_DEFAULT
    }.web.app/__/firebase/init.json`
  ).then((_) => _.json())

  return {
    options,
  }
}) satisfies LayoutServerLoad
