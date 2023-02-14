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
      res.status(405).send("Method Not Allowed")
      return
    }

    if (req.headers["stripe-signature"] === undefined) {
      functions.logger.warn("missing stripe-signature header", {
        headers: req.headers,
      })

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
      functions.logger.warn("failed to verify the signature of an Event", {
        error,
      })

      res.status(400).send()
      return
    }

    if (!s.is(event, checkoutSessionEventSchema)) {
      functions.logger.debug("ignore a valid Event", { event })

      res.status(200).send()
      return
    }

    const session = event.data.object

    try {
      await getFirestore()
        .collection(collection("checkout-sessions-dev"))
        .doc(session.id)
        .create(session)

      functions.logger.info("save session success", { id: session.id })

      res.status(200).json(session)
    } catch (error) {
      functions.logger.info("session already exists", { id: session.id })

      res.status(409).json(session)
    }
  })
