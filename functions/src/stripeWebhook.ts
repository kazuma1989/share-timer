import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import Stripe from "stripe"
import * as s from "superstruct"
import { collection } from "./firestorePath"
import { getEndpointSecret, getStripe } from "./getStripe"
import { nonNullable } from "./nonNullable"
import {
  CheckoutSession,
  checkoutSessionEventSchema,
  CustomClaims,
  Product,
} from "./schema"

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

    const { id: sessionId } = event.data.object

    const session = toCheckoutSession(
      await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items.data.price.product"],
      })
    )

    const ref = getFirestore()
      .collection(collection("checkout-sessions"))
      .doc(sessionId)

    await ref.set(session)

    functions.logger.info("save session success", { path: ref.path })

    res.status(200).json(session)

    try {
      const { client_reference_id, payment_status, products } = session

      if (payment_status !== "paid") return

      const hasPremium = products?.some(
        (_) => _.metadata?.plan_v1 === "premium"
      )
      if (!hasPremium) {
        throw {
          reason: "paid but no premium product was found",
          products,
        }
      }

      if (!client_reference_id) {
        throw {
          reason: "paid but no client_reference_id exists",
          session,
        }
      }

      const uid = client_reference_id

      const ref = getFirestore()
        .collection(collection("custom-claims"))
        .doc(uid)

      await ref.set({
        plan_v1: "premium",
      } satisfies CustomClaims)

      functions.logger.info("save custom-claims success", { path: ref.path })
    } catch (error) {
      functions.logger.error("failed to save custom-claims", { error })
    }
  })

function toCheckoutSession(session: Stripe.Checkout.Session): CheckoutSession {
  const {
    client_reference_id,
    created,
    customer_details,
    customer_email,
    line_items,
    payment_status,
    status,
  } = session

  const emails = Array.from(
    new Set([customer_email, customer_details?.email])
  ).filter(nonNullable)

  const products = line_items?.data.flatMap(toProduct) ?? null

  return {
    client_reference_id,
    created,
    payment_status,
    status,
    emails,
    products,
    payload: session,
  }
}

function toProduct({ price }: Stripe.LineItem): Product[] {
  if (!price) {
    return []
  }

  const { product } = price

  if (typeof product === "string") {
    return [{ id: product }]
  }

  if (product.deleted) {
    return []
  }

  const { id, name, metadata } = product
  return [{ id, name, metadata }]
}
