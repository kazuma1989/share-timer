import { createContext } from "./createContext"

export const [VideoProvider, useVideo] =
  createContext<HTMLVideoElement>("VideoProvider")
