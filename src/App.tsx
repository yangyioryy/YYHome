import { useEffect, useState } from 'react'
import { CosmicScene } from './components/CosmicScene'
import { ContentSections } from './components/ContentSections'
import { FloatingRails } from './components/FloatingRails'
import { Header } from './components/Header'
import { ToolsDock } from './components/ToolsDock'
import { navigationItems, type SectionId } from './data/site'

type Theme = 'dark' | 'light'

const getInitialTheme = (): Theme =>
  document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'

function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)
  const [activeSection, setActiveSection] = useState<SectionId>('home')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('yyhome-theme', theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#00030c' : '#edf4ff')
  }, [theme])

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined

    // 使用视口中部作为当前章节判定区域，避免短区块之间频繁跳动。
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0]

        if (visible) setActiveSection(visible.target.id as SectionId)
      },
      {
        rootMargin: '-24% 0px -58% 0px',
        threshold: [0, 0.2, 0.5, 0.8],
      },
    )

    navigationItems.forEach(({ id }) => {
      const section = document.getElementById(id)
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="page-frame" aria-hidden="true" />

      <Header
        activeSection={activeSection}
        theme={theme}
        onThemeToggle={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
      />

      <main id="main-content">
        <section className="hero-section" id="home">
          <CosmicScene />

          <FloatingRails />
          <ToolsDock />
        </section>

        <ContentSections />
      </main>
    </div>
  )
}

export default App
