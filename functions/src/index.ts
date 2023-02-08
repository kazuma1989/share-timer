import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { defineSecret } from "firebase-functions/params"
import Stripe from "stripe"
import * as s from "superstruct"

const STRIPE_API_KEY$ = defineSecret("STRIPE_API_KEY")
const STRIPE_ENDPOINT_SECRET$ = defineSecret("STRIPE_ENDPOINT_SECRET")

interface CheckoutSession extends s.Infer<typeof checkoutSessionSchema> {}

const checkoutSessionSchema = s.type({
  id: s.string(),
  uid: s.string(),
})

const stripeHeadersSchema = s.type({
  "stripe-signature": s.string(),
})

const app = initializeApp()
const auth = getAuth(app)
const firestore = getFirestore(app)

function collection<T extends "checkout-sessions-v1">(path: T): T {
  return path
}

function document<T extends "checkout-sessions-v1/{id}">(path: T): T {
  return path
}

export const checkoutSessionCompleted = functions
  .runWith({
    secrets: [STRIPE_API_KEY$, STRIPE_ENDPOINT_SECRET$],
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send()
      return
    }

    if (!s.is(req.headers, stripeHeadersSchema)) {
      res.status(400).send()
      return
    }

    const stripe = new Stripe(STRIPE_API_KEY$.value(), {
      apiVersion: "2022-11-15",
    })

    // TODO try-catch して 400 エラーを返したい
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      req.headers["stripe-signature"],
      STRIPE_ENDPOINT_SECRET$.value()
    )

    if (event.type !== "checkout.session.completed") {
      res.status(200).send()
      return
    }

    const session = event.data.object as Stripe.Checkout.Session

    try {
      await firestore
        .collection(collection("checkout-sessions-v1"))
        .doc(session.id)
        .create(session)

      res.status(200).json(session)
    } catch {
      res.status(409).json(session)
    }
  })

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

        const { uid } = data

        functions.logger.info(
          "customClaims",
          (await auth.getUser(uid)).customClaims
        )

        await auth.setCustomUserClaims(uid, {
          app_v1: {
            plan: "premium",
          },
        })

        break
      }

      case "delete": {
        break
      }
    }
  })
