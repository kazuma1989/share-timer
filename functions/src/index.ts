import { initializeApp } from "firebase-admin/app"

initializeApp()

export * from "./onWriteCheckoutSession"
export * from "./stripeWebhook"
