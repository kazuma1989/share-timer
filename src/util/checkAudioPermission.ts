export async function checkAudioPermission(
  src: string
): Promise<"canplay" | "denied"> {
  const audio = new Audio(src)

  const canPlay$ = audio.play().then(
    () => true,
    (reason) => reason?.name === "AbortError"
  )
  audio.pause()

  return (await canPlay$) ? "canplay" : "denied"
}
