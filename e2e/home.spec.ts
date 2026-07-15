import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    localStorage.setItem('yyhome-theme', 'dark')
  })
})

test('桌面首屏、主题和静态资源可用', async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 1024 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.locator('.cosmic-scene')).toBeVisible()
  await expect(page.locator('.hero-identity')).toHaveCount(0)
  await expect(page.locator('.tool-item')).toHaveCount(10)
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(hasHorizontalOverflow).toBe(false)

  const resumeUrl = await page.getByRole('link', { name: 'Resume' }).getAttribute('href')
  expect(resumeUrl).toBeTruthy()
  const resumeResponse = await page.request.get(new URL(resumeUrl!, page.url()).toString())
  expect(resumeResponse.ok()).toBe(true)
  expect(resumeResponse.headers()['content-type']).toContain('application/pdf')

  await page.getByRole('button', { name: '切换至浅色主题' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.screenshot({ path: 'artifacts/home-light.png', fullPage: false })
  await page.getByRole('button', { name: '切换至深色主题' }).click()

  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: false })
  await page.screenshot({ path: 'artifacts/home-fullpage.png', fullPage: true })
})

test('手机端菜单和横向 Dock 可用', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)

  await expect(page.getByRole('navigation', { name: '主导航' })).toBeHidden()
  await page.getByRole('button', { name: '打开导航菜单' }).click()
  const mobileNavigation = page.getByRole('navigation', { name: '移动端导航' })
  await expect(mobileNavigation).toBeVisible()
  await expect(mobileNavigation).toHaveCSS('opacity', '1')
  await expect(page.getByRole('link', { name: 'Projects' }).last()).toBeVisible()

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth + 1,
  )
  expect(hasHorizontalOverflow).toBe(false)
  await expect(page.locator('.tools-dock')).toHaveCSS('overflow-x', 'auto')

  await page.screenshot({ path: 'artifacts/home-mobile-menu.png', fullPage: false })
  await page.getByRole('button', { name: '关闭导航菜单' }).click()
  await expect(page.getByRole('navigation', { name: '移动端导航' })).toBeHidden()
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: false })
})
