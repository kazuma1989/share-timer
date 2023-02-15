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

export interface CheckoutSession
  extends s.Infer<typeof checkoutSessionSchema> {}

export const checkoutSessionSchema = s.type({
  client_reference_id: s.nullable(s.string()),
  created: s.number(),
  customer_details: s.nullable(
    s.type({
      email: s.nullable(s.string()),
      name: s.nullable(s.string()),
      phone: s.nullable(s.string()),
    })
  ),
  customer_email: s.nullable(s.string()),
  payment_status: s.enums(["paid", "unpaid", "no_payment_required"]),
  status: s.nullable(s.enums(["open", "complete", "expired"])),
  payload: s.any() as unknown as s.Describe<Stripe.Checkout.Session>,
})
