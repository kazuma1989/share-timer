import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import Stripe from "stripe"
import * as s from "superstruct"
import { collection } from "./firestorePath"
import { getEndpointSecret, getStripe } from "./getStripe"
import { checkoutSessionEventSchema } from "./schema"

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
      await getFirestore()
        .collection(collection("checkout-sessions-v1"))
        .doc(session.id)
        .create(session)

      res.status(200).json(session)
    } catch {
      res.status(409).json(session)
    }
  })
