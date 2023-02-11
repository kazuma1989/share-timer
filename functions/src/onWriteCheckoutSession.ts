import { getAuth } from "firebase-admin/auth"
import * as functions from "firebase-functions"
import * as s from "superstruct"
import { document } from "./firestorePath"
import { checkoutSessionSchema } from "./schema"

export const onWriteCheckoutSession = functions.firestore
  .document(document("checkout-sessions-v1/{id}"))
  .onWrite(async (change, context) => {
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

    switch (changeType) {
      case "create":
      case "update": {
        const [error, data] = s.validate(
          change.after.data(),
          checkoutSessionSchema
        )
        if (error) {
          functions.logger.error(error)
          break
        }

        const { client_reference_id: uid } = data

        functions.logger.debug("customClaims (before)", {
          customClaims: (await getAuth().getUser(uid)).customClaims,
        })

        await getAuth().setCustomUserClaims(uid, {
          app_v1: {
            plan: "premium",
          },
        })

        functions.logger.debug("customClaims (after)", {
          customClaims: (await getAuth().getUser(uid)).customClaims,
        })

        break
      }

      case "delete": {
        break
      }
    }
  })
