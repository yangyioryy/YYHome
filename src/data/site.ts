export const navigationItems = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
] as const

export type SectionId = (typeof navigationItems)[number]['id']

export const profile = {
  name: '杨轶',
  englishName: 'Yang Yi',
  role: 'Developer & Researcher',
  statement:
    '在智能系统、跨端应用与云端基础设施之间，构建可靠、清晰且富有质感的数字产品。',
  github: 'https://github.com/yangyioryy',
  linkedin: 'https://www.linkedin.com/in/yangyioryy/',
  email: 'yangyioryy@qq.com',
  resume: './resume.pdf',
} as const

export const projects = [
  {
    name: 'mail2tg',
    eyebrow: 'Cloud Automation',
    description:
      '将多路 IMAP 邮箱的新邮件稳定推送到 Telegram。基于 Cloudflare Workers 与 D1，无需自建服务器。',
    stack: ['TypeScript', 'Cloudflare Workers', 'D1'],
    href: 'https://github.com/yangyioryy/mail2tg',
    accent: '#62a4ff',
  },
  {
    name: 'XivDaily',
    eyebrow: 'Research Workflow',
    description:
      '围绕论文发现、阅读与收藏流程构建的移动端项目，让日常研究输入更连续、更轻量。',
    stack: ['Kotlin', 'Mobile', 'Research'],
    href: 'https://github.com/yangyioryy/XivDaily',
    accent: '#4fd1c5',
  },
  {
    name: 'LLMs Code Learning',
    eyebrow: 'AI Engineering',
    description:
      '记录大语言模型代码实践与实验过程，把模型概念拆解为可以运行、验证和继续迭代的实现。',
    stack: ['Python', 'LLM', 'Experiment'],
    href: 'https://github.com/yangyioryy/LLMs_code_learning',
    accent: '#f1b45a',
  },
] as const

export const notes = [
  {
    date: '2026.04',
    title: '把邮箱变成一条稳定的 Telegram 通知流',
    summary: '从轮询、去重到无服务器部署，整理 mail2tg 的工程取舍。',
    href: 'https://github.com/yangyioryy/mail2tg',
    readTime: 'Project note',
  },
  {
    date: '2026.06',
    title: '移动端论文阅读体验的跨端思考',
    summary: '围绕信息密度、状态同步与持续阅读，复盘 XivDaily 的产品结构。',
    href: 'https://github.com/yangyioryy/XivDaily',
    readTime: 'Build log',
  },
  {
    date: '2026.07',
    title: '用 Canvas 与 CSS 构建一片响应式深空',
    summary: '在性能、可访问性和视觉氛围之间，重建个人主页的宇宙场景。',
    href: '#home',
    readTime: 'Design note',
  },
] as const
