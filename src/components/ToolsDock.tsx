import type { IconType } from 'react-icons'
import type { CSSProperties } from 'react'
import { RiOpenaiFill } from 'react-icons/ri'
import {
  SiDocker,
  SiFigma,
  SiGithub,
  SiGooglescholar,
  SiLatex,
  SiNotion,
  SiPytorch,
  SiPython,
} from 'react-icons/si'
import { VscVscode } from 'react-icons/vsc'

type Tool = {
  name: string
  icon: IconType
  color: string
  glow: string
  href: string
}

const tools: Tool[] = [
  {
    name: 'VS Code',
    icon: VscVscode,
    color: '#24a8f2',
    glow: '36, 168, 242',
    href: 'https://code.visualstudio.com/',
  },
  {
    name: 'GitHub',
    icon: SiGithub,
    color: '#f5f7fa',
    glow: '225, 232, 244',
    href: 'https://github.com/',
  },
  {
    name: 'Docker',
    icon: SiDocker,
    color: '#2496ed',
    glow: '36, 150, 237',
    href: 'https://www.docker.com/',
  },
  {
    name: 'Python',
    icon: SiPython,
    color: '#ffd343',
    glow: '255, 211, 67',
    href: 'https://www.python.org/',
  },
  {
    name: 'PyTorch',
    icon: SiPytorch,
    color: '#ee4c2c',
    glow: '238, 76, 44',
    href: 'https://pytorch.org/',
  },
  {
    name: 'Notion',
    icon: SiNotion,
    color: '#ffffff',
    glow: '225, 232, 244',
    href: 'https://www.notion.so/',
  },
  {
    name: 'Figma',
    icon: SiFigma,
    color: '#a259ff',
    glow: '162, 89, 255',
    href: 'https://www.figma.com/',
  },
  {
    name: 'LaTeX',
    icon: SiLatex,
    color: '#35c9bc',
    glow: '53, 201, 188',
    href: 'https://www.latex-project.org/',
  },
  {
    name: 'Google Scholar',
    icon: SiGooglescholar,
    color: '#4285f4',
    glow: '66, 133, 244',
    href: 'https://scholar.google.com/',
  },
  {
    name: 'ChatGPT',
    icon: RiOpenaiFill,
    color: '#10a37f',
    glow: '16, 163, 127',
    href: 'https://chatgpt.com/',
  },
]

export function ToolsDock() {
  return (
    <div className="tools-area">
      <div className="section-divider" aria-hidden="true">
        <span className="divider-line" />
        <span className="divider-dot" />
        <p>TOOLS I USE</p>
        <span className="divider-dot" />
        <span className="divider-line" />
      </div>

      <div className="tools-dock" aria-label="常用开发与科研工具">
        {tools.map(({ name, icon: Icon, color, glow, href }, index) => (
          <a
            className="tool-item"
            href={href}
            target="_blank"
            rel="noreferrer"
            key={name}
            style={
              {
                '--tool-color': color,
                '--tool-glow': glow,
                '--tool-delay': `${index * 45}ms`,
              } as CSSProperties
            }
          >
            <span className="tool-icon-frame">
              <Icon className="tool-icon" aria-hidden="true" />
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
