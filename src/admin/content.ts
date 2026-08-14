import {
  toolIconKeys,
  type SiteContent,
  type SiteTool,
  type ToolIconKey,
} from '../data/site-content'

export const MAX_TOOLS = 24
export const MAX_RESUME_BYTES = 10 * 1024 * 1024

export type ToolDraft = Omit<SiteTool, 'id'>

function isToolIconKey(value: string): value is ToolIconKey {
  return toolIconKeys.some((key) => key === value)
}

export function validateTool(draft: ToolDraft, currentCount: number, editing = false) {
  const name = draft.name.trim()
  const href = draft.href.trim()
  const color = draft.color.trim().toLowerCase()

  if (!editing && currentCount >= MAX_TOOLS) throw new Error(`工具数量不能超过 ${MAX_TOOLS} 个`)
  if (name.length < 1 || name.length > 40) throw new Error('工具名称需为 1-40 个字符')

  let parsedUrl: URL
  try {
    parsedUrl = new URL(href)
  } catch {
    throw new Error('请输入有效的工具网址')
  }
  if (parsedUrl.protocol !== 'https:') throw new Error('工具网址必须使用 HTTPS')
  if (!isToolIconKey(draft.icon)) throw new Error('请选择有效图标')
  if (!/^#[0-9a-f]{6}$/.test(color)) throw new Error('请选择有效颜色')

  return { name, href: parsedUrl.toString(), icon: draft.icon, color }
}

export function createTool(draft: ToolDraft, currentCount: number): SiteTool {
  return {
    id: crypto.randomUUID(),
    ...validateTool(draft, currentCount),
  }
}

export function moveTool(tools: SiteTool[], index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= tools.length) return tools

  const reordered = [...tools]
  ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]
  return reordered
}

export async function validateResume(file: File) {
  if (file.size < 5 || file.size > MAX_RESUME_BYTES) {
    throw new Error('简历 PDF 大小需在 10 MB 以内')
  }
  if (file.type && file.type !== 'application/pdf') throw new Error('简历必须是 PDF 文件')
  if (!file.name.toLowerCase().endsWith('.pdf')) throw new Error('简历文件名必须以 .pdf 结尾')

  const signature = new TextDecoder().decode(await file.slice(0, 5).arrayBuffer())
  if (signature !== '%PDF-') throw new Error('文件内容不是有效的 PDF')
}

export function cloneContent(content: SiteContent): SiteContent {
  return JSON.parse(JSON.stringify(content)) as SiteContent
}
