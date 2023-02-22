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

export interface Product extends s.Infer<typeof productSchema> {}

const productSchema = s.type({
  id: s.string(),
  name: s.optional(s.string()),
  metadata: s.optional(
    s.type({
      plan_v1: s.optional(s.literal("premium")),
    })
  ),
})

export interface CheckoutSession
  extends s.Infer<typeof checkoutSessionSchema> {}

const checkoutSessionSchema = s.type({
  client_reference_id: s.nullable(s.string()),
  created: s.number(),
  payment_status: s.enums(["paid", "unpaid", "no_payment_required"]),
  status: s.nullable(s.enums(["open", "complete", "expired"])),

  emails: s.array(s.string()),
  products: s.nullable(s.array(productSchema)),
  payload: s.any() as unknown as s.Describe<Stripe.Checkout.Session>,
})

export interface CustomClaims extends s.Infer<typeof customClaimsSchema> {}

export const customClaimsSchema = s.type({
  plan_v1: s.optional(s.literal("premium")),
})
