import { expect, test } from '@playwright/test'

const navigationLabels = ['Home', 'About', 'Projects', 'Blog', 'Contact'] as const

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

test('桌面端只保留首页内容并支持点击特效', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.setViewportSize({ width: 1536, height: 1024 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.cosmic-scene')).toBeVisible()
  await expect(page.locator('.effects-canvas')).toBeVisible()
  await expect(page.locator('.tool-item')).toHaveCount(3)
  await expect(page.locator('#about, #projects, #blog, #contact')).toHaveCount(0)
  await expect(page.getByRole('button', { name: /切换至.+主题/ })).toHaveCount(0)

  const navigation = page.getByRole('navigation', { name: '主导航' })
  await expect(navigation).toBeVisible()
  for (const label of navigationLabels) {
    await expect(navigation.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      '#home',
    )
  }

  await expect(page.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '#home')
  await expect(page.getByRole('link', { name: '发送邮件' })).toHaveAttribute(
    'href',
    'mailto:yagnyioryy@gmail.com',
  )

  for (const { name, href } of expectedTools) {
    await expect(page.getByRole('link', { name })).toHaveAttribute('href', href)
  }

  await navigation.getByRole('link', { name: 'About' }).click()
  await expect(page).toHaveURL(/#home$/)

  const sceneBox = await page.locator('.cosmic-scene').boundingBox()
  expect(sceneBox).not.toBeNull()
  const clickRatioX = 0.5
  const clickRatioY = 0.34
  await page.mouse.click(
    sceneBox!.x + sceneBox!.width * clickRatioX,
    sceneBox!.y + sceneBox!.height * clickRatioY,
  )
  await page.waitForTimeout(90)

  const hasEffectPixels = await page.locator('.effects-canvas').evaluate(
    (canvas, position) => {
      const effectsCanvas = canvas as HTMLCanvasElement
      const context = effectsCanvas.getContext('2d')
      if (!context) return false

      const centerX = Math.floor(effectsCanvas.width * position.x)
      const centerY = Math.floor(effectsCanvas.height * position.y)
      const radius = Math.max(36, Math.floor(effectsCanvas.width * 0.08))
      const left = Math.max(0, centerX - radius)
      const top = Math.max(0, centerY - radius)
      const width = Math.min(effectsCanvas.width - left, radius * 2)
      const height = Math.min(effectsCanvas.height - top, radius * 2)
      const pixels = context.getImageData(left, top, width, height).data

      for (let index = 3; index < pixels.length; index += 4) {
        if (pixels[index] > 0) return true
      }
      return false
    },
    { x: clickRatioX, y: clickRatioY },
  )
  expect(hasEffectPixels).toBe(true)

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(hasHorizontalOverflow).toBe(false)

  await page.screenshot({ path: 'artifacts/home-click-effect.png', fullPage: false })
  await page.waitForTimeout(900)
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: false })
  await page.screenshot({ path: 'artifacts/home-fullpage.png', fullPage: true })
})

test('手机端菜单和三列工具栏可用', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.getByRole('navigation', { name: '主导航' })).toBeHidden()
  await page.getByRole('button', { name: '打开导航菜单' }).click()

  const mobileNavigation = page.getByRole('navigation', { name: '移动端导航' })
  await expect(mobileNavigation).toBeVisible()
  await expect(mobileNavigation).toHaveCSS('opacity', '1')
  for (const label of navigationLabels) {
    await expect(mobileNavigation.getByRole('link', { name: label })).toHaveAttribute(
      'href',
      '#home',
    )
  }
  await expect(mobileNavigation.getByRole('link', { name: 'Open resume' })).toHaveAttribute(
    'href',
    '#home',
  )

  await expect(page.locator('.tool-item')).toHaveCount(3)
  const toolColumnCount = await page.locator('.tools-dock').evaluate((dock) => {
    return getComputedStyle(dock).gridTemplateColumns.split(' ').length
  })
  expect(toolColumnCount).toBe(3)

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(hasHorizontalOverflow).toBe(false)

  await page.screenshot({ path: 'artifacts/home-mobile-menu.png', fullPage: false })
  await page.getByRole('button', { name: '关闭导航菜单' }).click()
  await expect(mobileNavigation).toBeHidden()
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: false })
})
