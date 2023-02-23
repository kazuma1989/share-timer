import { defineSecret } from "firebase-functions/params"
import Stripe from "stripe"

const STRIPE_API_KEY$ = defineSecret("STRIPE_API_KEY")
const STRIPE_ENDPOINT_SECRET$ = defineSecret("STRIPE_ENDPOINT_SECRET")

let stripe: Stripe | undefined

export function getStripe(): Stripe {
  return (stripe =
    stripe ||
    new Stripe(STRIPE_API_KEY$.value(), {
      apiVersion: "2022-11-15",
    }))
}

getStripe.secrets = [STRIPE_API_KEY$] as const

let endpointSecret: string | undefined

export function getEndpointSecret(): string {
  return (endpointSecret = endpointSecret || STRIPE_ENDPOINT_SECRET$.value())
}

getEndpointSecret.secrets = [STRIPE_ENDPOINT_SECRET$] as const
