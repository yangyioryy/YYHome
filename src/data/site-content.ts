import rawSiteContent from './site-content.json'

export const toolIconKeys = [
  'activity',
  'calculator',
  'code',
  'file-image',
  'file-text',
  'image-off',
  'languages',
  'link',
  'palette',
  'search',
  'video',
  'wrench',
] as const

export type ToolIconKey = (typeof toolIconKeys)[number]

export type SiteTool = {
  id: string
  name: string
  href: string
  icon: ToolIconKey
  color: string
}

export type SiteContent = {
  resume: {
    href: string
    fileName: string
  }
  tools: SiteTool[]
}

export const siteContent = rawSiteContent as SiteContent
