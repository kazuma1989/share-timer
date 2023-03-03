import type { FirebaseOptions } from "firebase/app"
import { installPolyfills } from "../installPolyfills"
import type { LayoutServerLoad } from "./$types"

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
