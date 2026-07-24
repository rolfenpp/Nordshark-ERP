import { aiApi } from '@/api/ai'

export async function askAI(
  question: string,
  context: { currentPage?: string },
): Promise<string> {
  const res = await aiApi.help(question, context.currentPage)
  return res.answer
}

export async function isAIConfigured(): Promise<boolean> {
  try {
    const s = await aiApi.status()
    return Boolean(s.configured)
  } catch {
    return false
  }
}
