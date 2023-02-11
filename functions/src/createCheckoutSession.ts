import * as functions from "firebase-functions"
import * as s from "superstruct"
import { getStripe } from "./getStripe"
import { HOSTING_ORIGIN$, STRIPE_PRICE_API_ID$ } from "./params"

const reqBodySchema = s.type({
  client_reference_id: s.string(),
})

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

    // CSRF 対策
    // Safari は sec-fetch-site に未対応
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site
    const validForSafari =
      req.headers["sec-fetch-site"] === undefined &&
      req.headers["origin"] === HOSTING_ORIGIN$.value()
    const validForOtherBrowsers =
      req.headers["sec-fetch-site"] === "same-origin"

    if (!validForSafari && !validForOtherBrowsers) {
      functions.logger.debug(req.headers)

      res
        .status(400)
        .send("We could not verify that it was a legitimate request.")
      return
    }

    const [error, data] = s.validate(req.body, reqBodySchema)
    if (error) {
      res.status(400).json({
        message: "The shape of the request body is unexpected.",
        reason: error,
      })
      return
    }

    const { client_reference_id } = data

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
      client_reference_id,
    })

    res.redirect(303, session.url!)
  })
