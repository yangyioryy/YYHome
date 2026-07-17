import { FileText, Mail } from 'lucide-react'
import { FaGithub, FaTelegram } from 'react-icons/fa6'
import { profile } from '../data/site'

const socialLinks = [
  {
    label: 'GitHub',
    href: profile.github,
    icon: FaGithub,
    external: true,
  },
  {
    label: 'Telegram',
    href: profile.telegram,
    icon: FaTelegram,
    external: true,
  },
  {
    label: '发送邮件',
    href: `mailto:${profile.email}`,
    icon: Mail,
    external: false,
  },
  {
    label: '简历暂未开放',
    href: profile.resume,
    icon: FileText,
    external: false,
  },
] as const

export function FloatingRails() {
  return (
    <>
      <aside className="social-rail" aria-label="社交链接">
        <div className="social-links">
          {socialLinks.map(({ label, href, icon: Icon, external }) => (
            <a
              key={label}
              className="social-link"
              href={href}
              aria-label={label}
              title={label}
              target={external ? '_blank' : undefined}
              rel={external ? 'noreferrer' : undefined}
            >
              <Icon size={20} strokeWidth={1.8} />
            </a>
          ))}
        </div>
        <span className="social-rail-line" />
      </aside>

      <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-cue-line">
          <span className="scroll-cue-dot" />
        </span>
        <span className="scroll-cue-label">CLICK</span>
      </div>
    </>
  )
}
