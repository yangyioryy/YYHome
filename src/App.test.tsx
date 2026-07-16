import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'
import { navigationItems } from './data/site'

const expectedTools = [
  {
    name: '图片去除背景',
    href: 'https://www.iloveimg.com/zh-cn/remove-background',
  },
  {
    name: 'PDF 插入图片',
    href: 'https://pdfcandy.com/cn/add-image-to-pdf.html',
  },
  {
    name: '探针',
    href: 'https://monitor.clever.ccwu.cc/#/',
  },
] as const

describe('YYHome', () => {
  it('只渲染 Home 内容并保留五个首页导航入口', () => {
    const { container } = render(<App />)
    const navigation = screen.getByRole('navigation', { name: '主导航' })

    navigationItems.forEach(({ id, label }) => {
      expect(within(navigation).getByRole('link', { name: label })).toHaveAttribute(
        'href',
        '#home',
      )

      if (id !== 'home') {
        expect(container.querySelector('#' + id)).not.toBeInTheDocument()
      }
    })

    expect(container.querySelector('#home')).toBeInTheDocument()
    expect(within(navigation).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('渲染三个指定工具和新的邮件链接', () => {
    const { container } = render(<App />)

    expect(container.querySelectorAll('.tool-item')).toHaveLength(3)
    expectedTools.forEach(({ name, href }) => {
      expect(screen.getByRole('link', { name })).toHaveAttribute('href', href)
      expect(screen.getByRole('link', { name })).toHaveAttribute('target', '_blank')
    })

    expect(screen.getByRole('link', { name: '发送邮件' })).toHaveAttribute(
      'href',
      'mailto:yagnyioryy@gmail.com',
    )
  })

  it('保留简历入口但移除主题切换功能', () => {
    render(<App />)

    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '#home')
    expect(screen.getByRole('link', { name: 'Open resume' })).toHaveAttribute(
      'href',
      '#home',
    )
    expect(screen.getByRole('link', { name: '简历暂未开放' })).toHaveAttribute(
      'href',
      '#home',
    )
    expect(screen.queryByRole('button', { name: /切换至.+主题/ })).not.toBeInTheDocument()
  })

  it('可以打开和关闭移动端导航', async () => {
    const user = userEvent.setup()
    render(<App />)
    const toggle = screen.getByRole('button', { name: '打开导航菜单' })

    await user.click(toggle)
    expect(screen.getByRole('button', { name: '关闭导航菜单' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )

    await user.click(screen.getByRole('button', { name: '关闭导航菜单' }))
    expect(screen.getByRole('button', { name: '打开导航菜单' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})
