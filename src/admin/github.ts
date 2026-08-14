import type { SiteContent } from '../data/site-content'

const repository = {
  owner: 'yangyioryy',
  name: 'YYHome',
  branch: 'master',
  contentPath: 'src/data/site-content.json',
  resumePath: 'public/resume.pdf',
} as const

type GitHubFile = {
  sha: string
  content: string
  encoding: string
}

type FileChange = {
  path: string
  content: string
}

const headers = (token: string) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'X-GitHub-Api-Version': '2022-11-28',
})

async function githubRequest<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { ...headers(token), ...init?.headers },
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(payload?.message || `GitHub 请求失败（${response.status}）`)
  }

  return (await response.json()) as T
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value.replace(/\s/g, '')), (character) => character.charCodeAt(0))
}

export async function verifyRepositoryAccess(token: string) {
  const repo = await githubRequest<{ permissions?: { push?: boolean } }>(
    `/repos/${repository.owner}/${repository.name}`,
    token,
  )
  if (repo.permissions?.push === false) throw new Error('该令牌没有仓库写权限')
}

async function getFile(
  path: string,
  token: string,
  ref: string = repository.branch,
): Promise<GitHubFile | null> {
  const response = await fetch(
    `https://api.github.com/repos/${repository.owner}/${repository.name}/contents/${path}?ref=${ref}`,
    { headers: headers(token) },
  )
  if (response.status === 404) return null
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(payload?.message || `读取 ${path} 失败（${response.status}）`)
  }
  return (await response.json()) as GitHubFile
}

async function commitFiles(
  changes: FileChange[],
  message: string,
  token: string,
  expectedContentSha: string,
) {
  const prefix = `/repos/${repository.owner}/${repository.name}`
  const head = await githubRequest<{ object: { sha: string } }>(
    `${prefix}/git/ref/heads/${repository.branch}`,
    token,
  )
  const currentContent = await getFile(repository.contentPath, token, head.object.sha)
  if (!currentContent || currentContent.sha !== expectedContentSha) {
    throw new Error('站点内容已在其他位置更新，请断开仓库后重新连接')
  }
  const parent = await githubRequest<{ tree: { sha: string } }>(
    `${prefix}/git/commits/${head.object.sha}`,
    token,
  )
  const blobs = await Promise.all(
    changes.map((change) =>
      githubRequest<{ sha: string }>(`${prefix}/git/blobs`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: change.content, encoding: 'base64' }),
      }),
    ),
  )
  const tree = await githubRequest<{ sha: string }>(`${prefix}/git/trees`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: changes.map((change, index) => ({
        path: change.path,
        mode: '100644',
        type: 'blob',
        sha: blobs[index].sha,
      })),
    }),
  })
  const commit = await githubRequest<{ sha: string; html_url: string }>(
    `${prefix}/git/commits`,
    token,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, tree: tree.sha, parents: [head.object.sha] }),
    },
  )
  await githubRequest(`${prefix}/git/refs/heads/${repository.branch}`, token, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sha: commit.sha, force: false }),
  })

  const contentIndex = changes.findIndex((change) => change.path === repository.contentPath)
  return { commit, contentSha: blobs[contentIndex].sha }
}

export async function loadRemoteContent(token: string) {
  const file = await getFile(repository.contentPath, token)
  if (!file || file.encoding !== 'base64') throw new Error('无法读取站点内容文件')

  const json = new TextDecoder().decode(base64ToBytes(file.content))
  return { content: JSON.parse(json) as SiteContent, contentSha: file.sha }
}

export async function publishContent(content: SiteContent, token: string, expectedContentSha: string) {
  const encoded = bytesToBase64(new TextEncoder().encode(`${JSON.stringify(content, null, 2)}\n`))
  return commitFiles(
    [{ path: repository.contentPath, content: encoded }],
    '[update] 通过管理后台更新站点内容',
    token,
    expectedContentSha,
  )
}

export async function publishResumeAndContent(
  file: File,
  content: SiteContent,
  token: string,
  expectedContentSha: string,
) {
  const resume = bytesToBase64(new Uint8Array(await file.arrayBuffer()))
  const siteData = bytesToBase64(
    new TextEncoder().encode(`${JSON.stringify(content, null, 2)}\n`),
  )
  return commitFiles(
    [
      { path: repository.resumePath, content: resume },
      { path: repository.contentPath, content: siteData },
    ],
    '[update] 通过管理后台更新简历',
    token,
    expectedContentSha,
  )
}
