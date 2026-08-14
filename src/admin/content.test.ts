import { describe, expect, it } from 'vitest'
import type { SiteTool } from '../data/site-content'
import { MAX_TOOLS, moveTool, validateResume, validateTool } from './content'

const tools: SiteTool[] = [
  { id: 'one', name: 'One', href: 'https://one.example/', icon: 'link', color: '#112233' },
  { id: 'two', name: 'Two', href: 'https://two.example/', icon: 'wrench', color: '#445566' },
]

describe('admin content validation', () => {
  it('normalizes a valid HTTPS tool', () => {
    expect(
      validateTool(
        { name: '  Useful tool  ', href: 'https://example.com/path', icon: 'link', color: '#AABBCC' },
        2,
      ),
    ).toEqual({
      name: 'Useful tool',
      href: 'https://example.com/path',
      icon: 'link',
      color: '#aabbcc',
    })
  })

  it('rejects non-HTTPS tool URLs', () => {
    expect(() =>
      validateTool(
        { name: 'Unsafe', href: 'http://example.com', icon: 'link', color: '#112233' },
        0,
      ),
    ).toThrow('HTTPS')
  })

  it('reorders tools without mutating the source array', () => {
    const reordered = moveTool(tools, 0, 1)
    expect(reordered.map((tool) => tool.id)).toEqual(['two', 'one'])
    expect(tools.map((tool) => tool.id)).toEqual(['one', 'two'])
  })

  it('keeps the order at a list boundary', () => {
    expect(moveTool(tools, 0, -1)).toBe(tools)
  })

  it('rejects a new tool when the limit is reached', () => {
    expect(() =>
      validateTool(
        { name: 'One more', href: 'https://example.com', icon: 'link', color: '#112233' },
        MAX_TOOLS,
      ),
    ).toThrow(`${MAX_TOOLS}`)
  })

  it('accepts a PDF signature and rejects disguised files', async () => {
    await expect(
      validateResume(new File(['%PDF-1.7\n'], 'resume.pdf', { type: 'application/pdf' })),
    ).resolves.toBeUndefined()
    await expect(
      validateResume(new File(['plain text'], 'resume.pdf', { type: 'application/pdf' })),
    ).rejects.toThrow('有效的 PDF')
  })
})
