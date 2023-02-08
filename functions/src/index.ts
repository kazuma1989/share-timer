import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"
import * as s from "superstruct"

interface CheckoutSession extends s.Infer<typeof checkoutSessionSchema> {}

const checkoutSessionSchema = s.type({
  id: s.string(),
  uid: s.string(),
})

const app = initializeApp()
const auth = getAuth(app)
const firestore = getFirestore(app)

function collection<T extends "checkout-sessions-v1">(path: T): T {
  return path
}

function document<T extends "checkout-sessions-v1/{id}">(path: T): T {
  return path
}

export const checkoutSessionCompleted = functions.https.onRequest(
  async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send()
      return
    }

    const [error, data] = s.validate(req.body, checkoutSessionSchema)
    if (error) {
      res.status(400).json(error)
      return
    }

    try {
      const { id } = data

      await firestore
        .collection(collection("checkout-sessions-v1"))
        .doc(id)
        .create(data)

      res.json(data)
    } catch {
      res.status(409).json(data)
    }
  }
)

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

        const { uid } = data

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

// http://127.0.0.1:5001/share-timer-2b51a/us-central1/addCustomClaims?uid=xxx
export const addCustomClaims = functions.https.onRequest(async (req, res) => {
  const { uid } = req.query
  if (typeof uid !== "string") {
    res.status(400).send()
    return
  }

  functions.logger.info("customClaims", (await auth.getUser(uid)).customClaims)

  await auth.setCustomUserClaims(uid, {
    app_v1: {
      id: "kazuma1989",
      plan: "premium",
    },
  })

  res.status(200).json((await auth.getUser(uid)).customClaims)
})

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true })
  response.send("Hello from Firebase!")
})

export const addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text

  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await firestore
    .collection("messages")
    .add({ original: original })

  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` })
})
