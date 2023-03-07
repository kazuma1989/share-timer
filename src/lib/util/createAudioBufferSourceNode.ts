export async function createAudioBufferSourceNode(
  context: BaseAudioContext,
  audioData: ArrayBuffer
): Promise<AudioBufferSourceNode> {
  const sourceNode = context.createBufferSource()
  sourceNode.buffer = await context.decodeAudioData(audioData.slice(0))
  sourceNode.connect(context.destination)

  return sourceNode
}
