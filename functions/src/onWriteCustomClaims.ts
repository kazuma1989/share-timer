import { getAuth } from "firebase-admin/auth"
import * as functions from "firebase-functions"
import * as s from "superstruct"
import { document } from "./firestorePath"
import { customClaimsSchema } from "./schema"

export const onWriteCustomClaims = functions.firestore
  .document(document("custom-claims", "{id}"))
  .onWrite(async (change) => {
    /**
     * | Operation   | before.exists | after.exists |
     * | ----------- | :-----------: | :----------: |
     * | create      |     false     |     true     |
     * | update      |     true      |     true     |
     * | delete      |     true      |    false     |
     * | (undefined) |     false     |    false     |
     */
    const changeType = !change.after.exists
      ? "delete"
      : !change.before.exists
      ? "create"
      : "update"

    let uid: string
    let customClaims: object | null

    switch (changeType) {
      case "create":
      case "update": {
        const [error, data] = s.validate(
          change.after.data(),
          customClaimsSchema
        )
        if (error) {
          functions.logger.warn(error)
          return
        }

        uid = change.after.id
        customClaims = data

        break
      }

      case "delete": {
        uid = change.before.id
        customClaims = null

        break
      }
    }

    functions.logger.debug("customClaims (before)", {
      customClaims: (await getAuth().getUser(uid)).customClaims,
    })

    await getAuth().setCustomUserClaims(uid, customClaims)

    functions.logger.debug("customClaims (after)", {
      customClaims: (await getAuth().getUser(uid)).customClaims,
    })
  })
