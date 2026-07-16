import { CosmicScene } from './components/CosmicScene'
import { FloatingRails } from './components/FloatingRails'
import { Header } from './components/Header'
import { ToolsDock } from './components/ToolsDock'

function App() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <div className="page-frame" aria-hidden="true" />

      <Header />

      <main id="main-content">
        <section className="hero-section" id="home">
          <CosmicScene />
          <FloatingRails />
          <ToolsDock />
        </section>
      </main>
    </div>
  )
}

export default App
