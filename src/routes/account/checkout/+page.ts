import { browser } from "$app/environment"
import { initRemoteFirestore } from "$lib/firestore/initRemoteFirestore"
import type { PageLoad } from "./$types"

export const load = (async ({ parent }) => {
  if (!browser) {
    return {}
  }

  const data = await parent()
  const firestore = await initRemoteFirestore(data.options)

  return {
    firestore,
  }
}) satisfies PageLoad
