import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import { defineString } from "firebase-functions/params"
import Stripe from "stripe"
import * as s from "superstruct"
import { getEndpointSecret, getStripe } from "./getStripe"
import { checkoutSessionEventSchema, checkoutSessionSchema } from "./schema"

const STRIPE_PRICE_API_ID$ = defineString("STRIPE_PRICE_API_ID")
const HOSTING_ORIGIN$ = defineString("HOSTING_ORIGIN")

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
    secrets: [...getStripe.secrets],
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send()
      return
    }

    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: STRIPE_PRICE_API_ID$.value(),
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: HOSTING_ORIGIN$.value() + "/checkout.html",
      cancel_url: HOSTING_ORIGIN$.value() + "/checkout.html",
      client_reference_id: "hello-kazuma1989",
    })

    res.redirect(303, session.url!)
  })

export const stripeWebhook = functions
  .runWith({
    secrets: [...getStripe.secrets, ...getEndpointSecret.secrets],
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

    const stripe = getStripe()

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers["stripe-signature"],
        getEndpointSecret()
      )
    } catch (error) {
      functions.logger.warn(error)

      res.status(400).send()
      return
    }

    if (!s.is(event, checkoutSessionEventSchema)) {
      res.status(200).send()
      return
    }

    const session = event.data.object

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
