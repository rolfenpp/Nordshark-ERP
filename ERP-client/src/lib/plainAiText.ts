/** Strip common markdown so Gemini output reads cleanly in plain Typography. */
export function plainAiText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\*\*(.+?)\*\*/gs, '$1')
    .replace(/__(.+?)__/gs, '$1')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/gs, '$1')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '• ')
    .replace(/\*/g, '')
    .trim()
}
