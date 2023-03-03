import type {
  PrerenderOption,
  TrailingSlash,
} from "@sveltejs/kit/types/private"

export const prerender = true satisfies PrerenderOption

export const trailingSlash = "always" satisfies TrailingSlash
