import { Download, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { navigationItems, profile } from '../data/site'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="site-logo" href="#home" onClick={closeMenu} aria-label="返回首页顶部">
          Y<span>.</span>
        </a>

        <nav className="desktop-navigation" aria-label="主导航">
          {navigationItems.map((item) => {
            const isHome = item.id === 'home'

            return (
              <a
                key={item.id}
                className={isHome ? 'nav-link is-active' : 'nav-link'}
                href="#home"
                aria-current={isHome ? 'page' : undefined}
                title={isHome ? undefined : '暂未开放，点击返回首页'}
              >
                {item.label}
              </a>
            )
          })}
        </nav>

        <div className="header-actions">
          <a
            className="resume-button desktop-resume"
            href={profile.resume}
            title="简历暂未开放"
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
        {navigationItems.map((item, index) => {
          const isHome = item.id === 'home'

          return (
            <a
              key={item.id}
              className={isHome ? 'mobile-nav-link is-active' : 'mobile-nav-link'}
              href="#home"
              onClick={closeMenu}
              title={isHome ? undefined : '暂未开放，点击返回首页'}
            >
              <span>{item.label}</span>
              <span className="mobile-nav-index">0{index + 1}</span>
            </a>
          )
        })}
        <a
          className="resume-button mobile-resume"
          href={profile.resume}
          title="简历暂未开放"
          onClick={closeMenu}
        >
          Open resume
          <Download size={15} aria-hidden="true" />
        </a>
      </nav>
    </header>
  )
}
