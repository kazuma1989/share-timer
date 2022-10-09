import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { SWRConfig } from "swr"
import { Router } from "wouter"
import { App } from "./App"
import "./color.css"
import "./global.css"

createRoot(globalThis.document.getElementById("root")!).render(
  <StrictMode>
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
        dedupingInterval: 86400_000,
        suspense: true,
      }}
    >
      <Router base={import.meta.env.BASE_URL.replace(/\/+$/, "")}>
        <App />
      </Router>
    </SWRConfig>
  </StrictMode>
)
