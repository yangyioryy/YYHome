import {
  Activity,
  Calculator,
  Code2,
  FileImage,
  FileText,
  ImageOff,
  Languages,
  Link,
  Palette,
  Search,
  Video,
  Wrench,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { siteContent, type ToolIconKey } from '../data/site-content'

const toolIcons: Record<ToolIconKey, typeof ImageOff> = {
  activity: Activity,
  calculator: Calculator,
  code: Code2,
  'file-image': FileImage,
  'file-text': FileText,
  'image-off': ImageOff,
  languages: Languages,
  link: Link,
  palette: Palette,
  search: Search,
  video: Video,
  wrench: Wrench,
}

function hexToRgb(hex: string) {
  const value = hex.replace('#', '')
  const normalized = value.length === 3 ? value.replace(/(.)/g, '$1$1') : value
  const channels = normalized.match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16))

  return channels?.length === 3 && channels.every(Number.isFinite)
    ? channels.join(', ')
    : '118, 184, 255'
}

export function ToolsDock() {
  return (
    <div className="tools-area">
      <div className="section-divider" aria-hidden="true">
        <span className="divider-line" />
        <span className="divider-dot" />
        <p>QUICK TOOLS</p>
        <span className="divider-dot" />
        <span className="divider-line" />
      </div>

      <div className="tools-dock" aria-label="常用在线工具">
        {siteContent.tools.map(({ id, name, icon, color, href }, index) => {
          const Icon = toolIcons[icon] ?? Wrench

          return (
            <a
              className="tool-item"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              key={id}
              style={
                {
                  '--tool-color': color,
                  '--tool-glow': hexToRgb(color),
                  '--tool-delay': `${Math.min(index, 8) * 70}ms`,
                } as CSSProperties
              }
            >
              <span className="tool-icon-frame">
                <Icon className="tool-icon" aria-hidden="true" strokeWidth={1.55} />
              </span>
              <span className="tool-name">{name}</span>
            </a>
          )
        })}
      </div>

      <div className="tools-tail" aria-hidden="true">
        <span />
      </div>
    </div>
  )
}
