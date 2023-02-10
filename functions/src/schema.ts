import Stripe from "stripe"
import * as s from "superstruct"

export const checkoutSessionEventSchema = s.type({
  // https://stripe.com/docs/api/events/types
  type: s.enums([
    "checkout.session.async_payment_failed",
    "checkout.session.async_payment_succeeded",
    "checkout.session.completed",
    "checkout.session.expired",
  ]),
  data: s.type({
    object: s.any() as unknown as s.Describe<Stripe.Checkout.Session>,
  }),
})

export const checkoutSessionSchema = s.type({
  client_reference_id: s.string(),
})
