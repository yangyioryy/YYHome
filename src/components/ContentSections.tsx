import {
  ArrowUpRight,
  BrainCircuit,
  CloudCog,
  Code2,
  Mail,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { FaGithub } from 'react-icons/fa6'
import { notes, profile, projects } from '../data/site'

const capabilities = [
  {
    icon: BrainCircuit,
    title: 'Intelligent Systems',
    description: '关注模型能力如何进入真实工作流，并通过可验证的工程实现产生价值。',
  },
  {
    icon: Code2,
    title: 'Product Engineering',
    description: '从交互、状态到交付链路，持续打磨跨端产品的完整使用体验。',
  },
  {
    icon: CloudCog,
    title: 'Cloud Infrastructure',
    description: '偏爱轻量、自动化且可观测的云端架构，让小型项目也保持可靠。',
  },
] as const

export function ContentSections() {
  return (
    <>
      <section className="content-section about-section" id="about">
        <div className="section-heading">
          <p className="section-kicker">01 / ABOUT</p>
          <h2>把复杂技术，变成清晰而可靠的体验。</h2>
        </div>

        <div className="about-layout">
          <div className="about-copy">
            <p className="about-lead">
              我是 {profile.name}（{profile.englishName}），一名持续探索智能系统与产品工程的开发者。
            </p>
            <p>
              我喜欢从真实问题出发，把研究、设计和工程连接起来：先理解信息如何流动，
              再选择足够简单的技术路径，最后用细节把体验做完整。
            </p>
            <div className="about-stats" aria-label="个人概览">
              <div>
                <strong>07</strong>
                <span>Public projects</span>
              </div>
              <div>
                <strong>10</strong>
                <span>Core tools</span>
              </div>
              <div>
                <strong>∞</strong>
                <span>Curiosity</span>
              </div>
            </div>
          </div>

          <div className="capability-list">
            {capabilities.map(({ icon: Icon, title, description }) => (
              <article className="capability-row" key={title}>
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="content-section projects-section" id="projects">
        <div className="section-heading section-heading-split">
          <div>
            <p className="section-kicker">02 / SELECTED PROJECTS</p>
            <h2>从想法到可运行系统。</h2>
          </div>
          <a className="inline-link" href={profile.github} target="_blank" rel="noreferrer">
            All repositories
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className="project-grid">
          {projects.map((project, index) => (
            <a
              className="project-card"
              href={project.href}
              target="_blank"
              rel="noreferrer"
              key={project.name}
              style={{ '--project-accent': project.accent } as CSSProperties}
            >
              <div className="project-card-topline">
                <span>0{index + 1}</span>
                <ArrowUpRight size={20} aria-hidden="true" />
              </div>
              <p className="project-eyebrow">{project.eyebrow}</p>
              <h3>{project.name}</h3>
              <p>{project.description}</p>
              <ul className="project-stack" aria-label={`${project.name} 技术栈`}>
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </a>
          ))}
        </div>
      </section>

      <section className="content-section blog-section" id="blog">
        <div className="section-heading">
          <p className="section-kicker">03 / NOTES</p>
          <h2>记录构建过程中的判断与发现。</h2>
        </div>

        <div className="notes-list">
          {notes.map((note, index) => (
            <a
              className="note-row"
              href={note.href}
              target={note.href.startsWith('http') ? '_blank' : undefined}
              rel={note.href.startsWith('http') ? 'noreferrer' : undefined}
              key={note.title}
            >
              <span className="note-index">0{index + 1}</span>
              <div className="note-content">
                <div className="note-meta">
                  <time>{note.date}</time>
                  <span>{note.readTime}</span>
                </div>
                <h3>{note.title}</h3>
                <p>{note.summary}</p>
              </div>
              <ArrowUpRight size={21} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="content-section contact-section" id="contact">
        <div className="contact-orbit" aria-hidden="true" />
        <div className="contact-copy">
          <p className="section-kicker">04 / CONTACT</p>
          <h2>有值得一起完成的想法？</h2>
          <p>
            无论是智能应用、跨端产品，还是一段值得仔细打磨的工程体验，欢迎来聊。
          </p>
          <a className="contact-email" href={`mailto:${profile.email}`}>
            <Mail size={22} aria-hidden="true" />
            {profile.email}
            <ArrowUpRight size={20} aria-hidden="true" />
          </a>
        </div>

        <div className="contact-links" aria-label="其他联系方式">
          <a href={profile.github} target="_blank" rel="noreferrer">
            <FaGithub size={18} aria-hidden="true" />
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <p>Designed and built by {profile.englishName}.</p>
        <a href="#home">Back to orbit ↑</a>
      </footer>
    </>
  )
}
