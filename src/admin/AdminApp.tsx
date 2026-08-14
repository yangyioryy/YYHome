import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Check,
  ExternalLink,
  FileText,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  Wrench,
  X,
} from 'lucide-react'
import { type FormEvent, type MouseEvent, useEffect, useMemo, useState } from 'react'
import { siteContent, toolIconKeys, type SiteContent, type SiteTool } from '../data/site-content'
import { verifyAdminPassword } from './auth'
import {
  cloneContent,
  createTool,
  MAX_RESUME_BYTES,
  moveTool,
  type ToolDraft,
  validateResume,
  validateTool,
} from './content'
import {
  loadRemoteContent,
  publishContent,
  publishResumeAndContent,
  verifyRepositoryAccess,
} from './github'

const emptyDraft: ToolDraft = {
  name: '',
  href: 'https://',
  icon: 'wrench',
  color: '#2f7d5b',
}

const iconLabels = {
  activity: '监控',
  calculator: '计算器',
  code: '代码',
  'file-image': '图片文件',
  'file-text': '文档',
  'image-off': '图片处理',
  languages: '翻译',
  link: '链接',
  palette: '设计',
  search: '搜索',
  video: '视频',
  wrench: '通用工具',
} as const

type AdminTab = 'tools' | 'resume'

export function AdminApp() {
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [contentSha, setContentSha] = useState('')
  const [tokenInput, setTokenInput] = useState('')
  const [content, setContent] = useState<SiteContent>(() => cloneContent(siteContent))
  const [publishedContent, setPublishedContent] = useState<SiteContent>(() => cloneContent(siteContent))
  const [tab, setTab] = useState<AdminTab>('tools')
  const [draft, setDraft] = useState<ToolDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const hasChanges = useMemo(
    () => JSON.stringify(content) !== JSON.stringify(publishedContent),
    [content, publishedContent],
  )

  useEffect(() => {
    if (!hasChanges) return undefined

    const warnBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warnBeforeUnload)
    return () => window.removeEventListener('beforeunload', warnBeforeUnload)
  }, [hasChanges])

  const resetMessages = () => {
    setError('')
    setNotice('')
  }

  const handleUnlock = async (event: FormEvent) => {
    event.preventDefault()
    resetMessages()
    setBusy(true)
    try {
      if (!(await verifyAdminPassword(password))) throw new Error('密码不正确')
      setUnlocked(true)
      setPassword('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '验证失败')
    } finally {
      setBusy(false)
    }
  }

  const handleConnect = async (event: FormEvent) => {
    event.preventDefault()
    resetMessages()
    const candidate = tokenInput.trim()
    if (!candidate) {
      setError('请输入发布令牌')
      return
    }

    setBusy(true)
    try {
      await verifyRepositoryAccess(candidate)
      const remote = await loadRemoteContent(candidate)
      setToken(candidate)
      setContentSha(remote.contentSha)
      setTokenInput('')
      setContent(cloneContent(remote.content))
      setPublishedContent(cloneContent(remote.content))
      setNotice('仓库已连接')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '仓库连接失败')
    } finally {
      setBusy(false)
    }
  }

  const confirmDiscardChanges = () =>
    !hasChanges || window.confirm('存在未发布的工具变更，确认放弃？')

  const clearConnection = () => {
    setToken('')
    setContentSha('')
    setTokenInput('')
    setContent(cloneContent(siteContent))
    setPublishedContent(cloneContent(siteContent))
    setEditingId(null)
    setDraft(emptyDraft)
    resetMessages()
  }

  const disconnect = () => {
    if (confirmDiscardChanges()) clearConnection()
  }

  const lock = () => {
    if (!confirmDiscardChanges()) return
    clearConnection()
    setUnlocked(false)
  }

  const confirmPageNavigation = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!confirmDiscardChanges()) event.preventDefault()
  }

  const updateTools = (tools: SiteTool[]) => {
    setContent((current) => ({ ...current, tools }))
    setNotice('')
  }

  const editTool = (tool: SiteTool) => {
    setEditingId(tool.id)
    setDraft({ name: tool.name, href: tool.href, icon: tool.icon, color: tool.color })
    resetMessages()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft(emptyDraft)
    setError('')
  }

  const submitTool = (event: FormEvent) => {
    event.preventDefault()
    resetMessages()
    try {
      if (editingId) {
        const validated = validateTool(draft, content.tools.length, true)
        updateTools(
          content.tools.map((tool) => (tool.id === editingId ? { ...tool, ...validated } : tool)),
        )
      } else {
        updateTools([...content.tools, createTool(draft, content.tools.length)])
      }
      setEditingId(null)
      setDraft(emptyDraft)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '工具信息无效')
    }
  }

  const removeTool = (tool: SiteTool) => {
    if (!window.confirm(`确认删除“${tool.name}”？`)) return
    updateTools(content.tools.filter((item) => item.id !== tool.id))
    if (editingId === tool.id) cancelEdit()
  }

  const saveTools = async () => {
    resetMessages()
    setBusy(true)
    try {
      const result = await publishContent(content, token, contentSha)
      setContentSha(result.contentSha)
      setPublishedContent(cloneContent(content))
      setNotice(`工具变更已发布：${result.commit.html_url}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '发布失败')
    } finally {
      setBusy(false)
    }
  }

  const uploadResume = async (file: File | undefined) => {
    if (!file) return
    resetMessages()
    setBusy(true)
    try {
      await validateResume(file)
      const nextPublishedContent = {
        ...publishedContent,
        resume: { href: './resume.pdf', fileName: file.name },
      }
      const result = await publishResumeAndContent(
        file,
        nextPublishedContent,
        token,
        contentSha,
      )
      setContentSha(result.contentSha)
      setContent((current) => ({ ...current, resume: nextPublishedContent.resume }))
      setPublishedContent(cloneContent(nextPublishedContent))
      setNotice(`简历已更新：${result.commit.html_url}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '简历上传失败')
    } finally {
      setBusy(false)
    }
  }

  if (!unlocked) {
    return (
      <main className="auth-shell">
        <form className="auth-panel" onSubmit={handleUnlock}>
          <a className="back-link" href="../">
            <ArrowLeft size={16} aria-hidden="true" /> 返回首页
          </a>
          <div className="admin-mark" aria-hidden="true">Y.</div>
          <p className="eyebrow">YYHOME</p>
          <h1>Admin</h1>
          <label htmlFor="admin-password">管理密码</label>
          <div className="input-with-icon">
            <KeyRound size={18} aria-hidden="true" />
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              required
            />
          </div>
          {error && <p className="form-message is-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? '验证中...' : '进入管理台'}
          </button>
        </form>
      </main>
    )
  }

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div className="admin-header-inner">
          <a className="admin-brand" href="../" onClick={confirmPageNavigation}>Y.<span>Admin</span></a>
          <div className="admin-header-actions">
            {token && <span className="connection-status"><Check size={14} /> 已连接</span>}
            <a className="icon-action" href="../" onClick={confirmPageNavigation} title="打开首页" aria-label="打开首页">
              <ExternalLink size={18} />
            </a>
            <button className="icon-action" type="button" onClick={lock} disabled={busy} title="锁定管理台" aria-label="锁定管理台">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {!token ? (
        <main className="connect-shell">
          <form className="connect-panel" onSubmit={handleConnect}>
            <KeyRound size={22} aria-hidden="true" />
            <h1>连接内容仓库</h1>
            <label htmlFor="github-token">GitHub fine-grained token</label>
            <input
              id="github-token"
              type="password"
              autoComplete="off"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              placeholder="github_pat_..."
              required
            />
            <p className="field-meta">Repository: yangyioryy/YYHome · Contents: Read and write</p>
            {error && <p className="form-message is-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={busy}>
              {busy ? '连接中...' : '连接仓库'}
            </button>
          </form>
        </main>
      ) : (
        <main className="admin-main">
          <div className="admin-title-row">
            <div>
              <p className="eyebrow">CONTENT</p>
              <h1>站点管理</h1>
            </div>
            <button className="text-button" type="button" onClick={disconnect} disabled={busy}>断开仓库</button>
          </div>

          <div className="admin-tabs" role="tablist" aria-label="管理视图">
            <button id="tools-tab" type="button" role="tab" aria-controls="tools-panel" aria-selected={tab === 'tools'} className={tab === 'tools' ? 'is-active' : ''} onClick={() => setTab('tools')}>
              <Wrench size={16} /> 工具管理
            </button>
            <button id="resume-tab" type="button" role="tab" aria-controls="resume-panel" aria-selected={tab === 'resume'} className={tab === 'resume' ? 'is-active' : ''} onClick={() => setTab('resume')}>
              <FileText size={16} /> 简历文件
            </button>
          </div>

          {error && <p className="form-message is-error page-message" role="alert">{error}</p>}
          {notice && <p className="form-message is-success page-message" role="status">{notice}</p>}

          {tab === 'tools' ? (
            <div id="tools-panel" className="tools-workspace" role="tabpanel" aria-labelledby="tools-tab">
              <section className="workspace-section" aria-labelledby="tools-heading">
                <div className="section-heading">
                  <div>
                    <h2 id="tools-heading">工具列表</h2>
                    <p>{content.tools.length} 个工具</p>
                  </div>
                  <button className="primary-button compact" type="button" onClick={saveTools} disabled={busy || !hasChanges}>
                    <Save size={16} /> {busy ? '发布中...' : '发布变更'}
                  </button>
                </div>

                <div className="admin-tool-list">
                  {content.tools.map((tool, index) => (
                    <article className="admin-tool-item" key={tool.id}>
                      <span className="tool-swatch" style={{ background: tool.color }} aria-hidden="true" />
                      <div className="admin-tool-copy">
                        <strong>{tool.name}</strong>
                        <span>{tool.href}</span>
                      </div>
                      <div className="row-actions">
                        <button type="button" onClick={() => updateTools(moveTool(content.tools, index, -1))} disabled={index === 0} title="上移" aria-label={`上移 ${tool.name}`}><ArrowUp size={16} /></button>
                        <button type="button" onClick={() => updateTools(moveTool(content.tools, index, 1))} disabled={index === content.tools.length - 1} title="下移" aria-label={`下移 ${tool.name}`}><ArrowDown size={16} /></button>
                        <button type="button" onClick={() => editTool(tool)} title="编辑" aria-label={`编辑 ${tool.name}`}><Pencil size={16} /></button>
                        <button className="danger-action" type="button" onClick={() => removeTool(tool)} title="删除" aria-label={`删除 ${tool.name}`}><Trash2 size={16} /></button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="workspace-section editor-section" aria-labelledby="editor-heading">
                <div className="section-heading">
                  <div>
                    <h2 id="editor-heading">{editingId ? '编辑工具' : '添加工具'}</h2>
                    <p>{editingId ? '修改当前条目' : '创建新的快捷入口'}</p>
                  </div>
                  {editingId && <button className="icon-action" type="button" onClick={cancelEdit} title="取消编辑" aria-label="取消编辑"><X size={18} /></button>}
                </div>
                <form className="tool-form" onSubmit={submitTool}>
                  <label htmlFor="tool-name">名称</label>
                  <input id="tool-name" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} maxLength={40} required />
                  <label htmlFor="tool-url">网址</label>
                  <input id="tool-url" type="url" value={draft.href} onChange={(event) => setDraft({ ...draft, href: event.target.value })} required />
                  <div className="form-grid">
                    <div>
                      <label htmlFor="tool-icon">图标</label>
                      <select id="tool-icon" value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value as ToolDraft['icon'] })}>
                        {toolIconKeys.map((key) => <option value={key} key={key}>{iconLabels[key]}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="tool-color">颜色</label>
                      <input id="tool-color" className="color-input" type="color" value={draft.color} onChange={(event) => setDraft({ ...draft, color: event.target.value })} />
                    </div>
                  </div>
                  <button className="secondary-button" type="submit">
                    {editingId ? <Save size={16} /> : <Plus size={16} />}
                    {editingId ? '保存到列表' : '添加到列表'}
                  </button>
                </form>
              </section>
            </div>
          ) : (
            <section id="resume-panel" className="workspace-section resume-section" role="tabpanel" aria-labelledby="resume-tab resume-heading">
              <div className="section-heading">
                <div>
                  <h2 id="resume-heading">简历文件</h2>
                  <p>{content.resume.fileName || '尚未上传'}</p>
                </div>
                {content.resume.href !== '#home' && <a className="text-button" href={`../${content.resume.href.replace('./', '')}`} target="_blank" rel="noreferrer">查看当前简历 <ExternalLink size={14} /></a>}
              </div>
              <label className={busy ? 'upload-zone is-disabled' : 'upload-zone'}>
                <Upload size={26} aria-hidden="true" />
                <strong>{content.resume.fileName ? '替换 PDF' : '上传 PDF'}</strong>
                <span>最大 {MAX_RESUME_BYTES / 1024 / 1024} MB</span>
                <input type="file" accept="application/pdf,.pdf" disabled={busy} onChange={(event) => void uploadResume(event.target.files?.[0])} />
              </label>
            </section>
          )}
        </main>
      )}
    </div>
  )
}
