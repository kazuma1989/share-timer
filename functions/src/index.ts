import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { defineSecret } from "firebase-functions/params"
import Stripe from "stripe"
import * as s from "superstruct"

const STRIPE_API_KEY$ = defineSecret("STRIPE_API_KEY")
const STRIPE_ENDPOINT_SECRET$ = defineSecret("STRIPE_ENDPOINT_SECRET")

const checkoutSessionSchema = s.type({
  client_reference_id: s.string(),
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

export const createCheckoutSession = functions
  .runWith({
    secrets: [STRIPE_API_KEY$],
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send()
      return
    }

    const stripe = new Stripe(STRIPE_API_KEY$.value(), {
      apiVersion: "2022-11-15",
    })

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1MZ8M1GVtjqV2UHuz3wUfODe",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success.html",
      cancel_url: "http://localhost:3000/cancel.html",
      client_reference_id: "hello-kazuma1989",
    })

    res.redirect(303, session.url!)
  })

export const stripeWebhook = functions
  .runWith({
    secrets: [STRIPE_API_KEY$, STRIPE_ENDPOINT_SECRET$],
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send()
      return
    }

    if (req.headers["stripe-signature"] === undefined) {
      functions.logger.warn("missing stripe-signature header")

      res.status(400).send("missing stripe-signature header")
      return
    }

    const stripe = new Stripe(STRIPE_API_KEY$.value(), {
      apiVersion: "2022-11-15",
    })

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        STRIPE_ENDPOINT_SECRET$.value()
      )
    } catch (error) {
      functions.logger.warn(error)

      res.status(400).send()
      return
    }

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

        const { client_reference_id: uid } = data

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
