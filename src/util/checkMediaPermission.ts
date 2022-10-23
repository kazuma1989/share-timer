export type Permission = "canplay" | "denied"

export async function checkMediaPermission(
  media: HTMLMediaElement
): Promise<Permission> {
  const canPlay$ = media.play().then(
    () => true,
    (reason) => reason?.name === "AbortError"
  )
  media.pause()
  media.currentTime = 0

  return (await canPlay$) ? "canplay" : "denied"
}
