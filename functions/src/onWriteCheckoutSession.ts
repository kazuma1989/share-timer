import { getAuth } from "firebase-admin/auth"
import * as functions from "firebase-functions"
import * as s from "superstruct"
import { document } from "./firestorePath"
import { checkoutSessionSchema, CustomClaims } from "./schema"

export const onWriteCheckoutSession = functions.firestore
  .document(document("checkout-sessions", "{id}"))
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

        const { client_reference_id, payment_status, products } = data
        if (payment_status !== "paid") break

        if (!client_reference_id) {
          functions.logger.error("no client_reference_id exists", { data })
          break
        }

        const hasPremium = products?.some(
          (_) => _.metadata?.plan_v1 === "premium"
        )
        if (!hasPremium) {
          functions.logger.error("no premium product was found", { products })
          break
        }

        const uid = client_reference_id

        const { customClaims } = await getAuth().getUser(uid)

        functions.logger.debug("customClaims (before)", { customClaims })

        await getAuth().setCustomUserClaims(uid, {
          ...customClaims,
          plan_v1: "premium",
        } satisfies CustomClaims)

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
