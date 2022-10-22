export async function checkAudioPermission(
  audio: HTMLMediaElement
): Promise<"canplay" | "denied"> {
  const canPlay$ = audio.play().then(
    () => true,
    (reason) => reason?.name === "AbortError"
  )
  audio.pause()
  audio.currentTime = 0

  return (await canPlay$) ? "canplay" : "denied"
}
