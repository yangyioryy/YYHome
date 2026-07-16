import { Activity, FileImage, ImageOff } from 'lucide-react'
import type { CSSProperties } from 'react'

type Tool = {
  name: string
  icon: typeof ImageOff
  color: string
  glow: string
  href: string
}

const tools: Tool[] = [
  {
    name: '图片去除背景',
    icon: ImageOff,
    color: '#76b8ff',
    glow: '118, 184, 255',
    href: 'https://www.iloveimg.com/zh-cn/remove-background',
  },
  {
    name: 'PDF 插入图片',
    icon: FileImage,
    color: '#9aaeff',
    glow: '154, 174, 255',
    href: 'https://pdfcandy.com/cn/add-image-to-pdf.html',
  },
  {
    name: '探针',
    icon: Activity,
    color: '#54d5ff',
    glow: '84, 213, 255',
    href: 'https://monitor.clever.ccwu.cc/#/',
  },
]

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
        {tools.map(({ name, icon: Icon, color, glow, href }, index) => (
          <a
            className="tool-item"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            key={name}
            style={
              {
                '--tool-color': color,
                '--tool-glow': glow,
                '--tool-delay': `${index * 70}ms`,
              } as CSSProperties
            }
          >
            <span className="tool-icon-frame">
              <Icon className="tool-icon" aria-hidden="true" strokeWidth={1.55} />
            </span>
            <span className="tool-name">{name}</span>
          </a>
        ))}
      </div>

      <div className="tools-tail" aria-hidden="true">
        <span />
      </div>
    </div>
  )
}
