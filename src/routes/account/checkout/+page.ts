import { browser } from "$app/environment"
import { initRemoteFirestore } from "$lib/firestore/initRemoteFirestore"
import type { PageLoad } from "./$types"

export const load = (async () => {
  if (!browser) {
    return {}
  }

  const firestore = await initRemoteFirestore()

  return {
    firestore,
  }
}) satisfies PageLoad
