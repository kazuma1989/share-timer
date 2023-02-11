import { getAuth } from "firebase-admin/auth"
import * as functions from "firebase-functions"
import * as s from "superstruct"
import { getStripe } from "./getStripe"
import { HOSTING_ORIGIN$, STRIPE_PRICE_API_ID$ } from "./params"

const reqBodySchema = s.type({
  idToken: s.string(),
})

export const createCheckoutSession = functions
  .runWith({
    secrets: [...getStripe.secrets],
  })
  .https.onRequest(async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send("Method Not Allowed")
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
      functions.logger.debug("CSRF check failed", { headers: req.headers })

      res
        .status(400)
        .send("We could not verify that it was a legitimate request.")
      return
    }

    const [error, data] = s.validate(req.body, reqBodySchema)
    if (error) {
      functions.logger.debug("invalid request body form", {
        body: req.body,
        error,
      })

      res.status(400).json({
        message: "The shape of the request body is unexpected.",
        reason: error,
      })
      return
    }

    const { idToken } = data

    let uid: string
    try {
      const _ = await getAuth().verifyIdToken(idToken)
      uid = _.uid
    } catch (error: any) {
      functions.logger.debug("verify id token failed", { ...error })

      res.status(401).send("Could not confirm that you are signed in.")
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
      client_reference_id: uid,
    })

    functions.logger.info("create session success", { id: session.id })

    res.redirect(303, session.url!)
  })
