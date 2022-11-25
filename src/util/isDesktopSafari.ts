export function isDesktopSafari(): boolean {
  const ua = navigator.userAgent.toLowerCase()

  const isTouchDevice = "ontouchend" in document
  const isSafari =
    ua.includes("safari/") &&
    !(ua.includes("chrome/") || ua.includes("chromium/"))

  return !isTouchDevice && isSafari
}
