import { Download, Menu, Moon, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { navigationItems, profile, type SectionId } from '../data/site'

type HeaderProps = {
  activeSection: SectionId
  theme: 'dark' | 'light'
  onThemeToggle: () => void
}

export function Header({ activeSection, theme, onThemeToggle }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="site-logo" href="#home" onClick={closeMenu} aria-label="返回首页顶部">
          Y<span>.</span>
        </a>

        <nav className="desktop-navigation" aria-label="主导航">
          {navigationItems.map((item) => (
            <a
              key={item.id}
              className={activeSection === item.id ? 'nav-link is-active' : 'nav-link'}
              href={`#${item.id}`}
              aria-current={activeSection === item.id ? 'page' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button
            className="icon-button theme-toggle"
            type="button"
            onClick={onThemeToggle}
            aria-label={theme === 'dark' ? '切换至浅色主题' : '切换至深色主题'}
            title={theme === 'dark' ? '切换至浅色主题' : '切换至深色主题'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <a
            className="resume-button desktop-resume"
            href={profile.resume}
            target="_blank"
            rel="noreferrer"
          >
            Resume
            <Download size={15} aria-hidden="true" />
          </a>

          <button
            className="icon-button menu-toggle"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <nav
        id="mobile-navigation"
        className={menuOpen ? 'mobile-navigation is-open' : 'mobile-navigation'}
        aria-label="移动端导航"
      >
        {navigationItems.map((item) => (
          <a
            key={item.id}
            className={activeSection === item.id ? 'mobile-nav-link is-active' : 'mobile-nav-link'}
            href={`#${item.id}`}
            onClick={closeMenu}
          >
            <span>{item.label}</span>
            <span className="mobile-nav-index">0{navigationItems.indexOf(item) + 1}</span>
          </a>
        ))}
        <a
          className="resume-button mobile-resume"
          href={profile.resume}
          target="_blank"
          rel="noreferrer"
          onClick={closeMenu}
        >
          Open resume
          <Download size={15} aria-hidden="true" />
        </a>
      </nav>
    </header>
  )
}
