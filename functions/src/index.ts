import * as admin from "firebase-admin"
import * as functions from "firebase-functions"

const app = admin.initializeApp()

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
  const writeResult = await app
    .firestore()
    .collection("messages")
    .add({ original: original })

  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` })
})
