import { initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import * as functions from "firebase-functions"

const app = initializeApp()
const auth = getAuth(app)
const firestore = getFirestore(app)

export const checkoutSessionCompleted = functions.https.onRequest(
  async (req, res) => {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST")
      res.status(405).send()
      return
    }

    try {
      // TODO req.body の検証をしないと危ない
      const id = req.body.id

      await firestore
        .collection("checkout-sessions-v1")
        .doc(id)
        // TODO req.body の検証をしないと危ない
        .create(req.body)

      // TODO req.body の検証をしないと危ない
      res.json(req.body)
    } catch {
      // TODO req.body の検証をしないと危ない
      res.status(409).json(req.body)
    }
  }
)

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
