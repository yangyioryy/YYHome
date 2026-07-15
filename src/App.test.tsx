import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { navigationItems } from './data/site'

describe('YYHome', () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = 'dark'
  })

  it('渲染完整导航、章节和工具矩阵', () => {
    const { container } = render(<App />)
    const navigation = screen.getByRole('navigation', { name: '主导航' })

    navigationItems.forEach(({ id, label }) => {
      expect(within(navigation).getByRole('link', { name: label })).toHaveAttribute(
        'href',
        `#${id}`,
      )
      expect(container.querySelector(`#${id}`)).toBeInTheDocument()
    })

    expect(container.querySelectorAll('.tool-item')).toHaveLength(10)
    expect(container.querySelector('#home')).not.toHaveTextContent('DEVELOPER / RESEARCHER')
    expect(container.querySelector('#home')).not.toHaveTextContent('Explore selected work')
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute(
      'href',
      './resume.pdf',
    )
  })

  it('切换主题并写入本地存储', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '切换至浅色主题' }))

    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
    expect(localStorage.getItem('yyhome-theme')).toBe('light')
    expect(screen.getByRole('button', { name: '切换至深色主题' })).toBeInTheDocument()
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
