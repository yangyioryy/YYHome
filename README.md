# YYHome

一套以深空、行星地平线与玻璃质感为核心视觉的个人主页。
项目采用 React、TypeScript 与 Vite 构建，最终产物是可直接部署到
GitHub Pages 的纯静态文件。

## 已实现

- 设计稿风格的沉浸式深空首屏
- Canvas 确定性星点与粒子波动画
- 行星地平线、轨道、流星和动态光晕
- Home / About / Projects / Blog / Contact 单页导航
- 滚动章节高亮、移动端菜单与键盘焦点状态
- 深色 / 浅色主题切换及本地持久化
- GitHub、LinkedIn、Email、Resume 悬浮入口
- 10 项开发与科研工具 Dock
- 响应式桌面、平板与手机布局
- `prefers-reduced-motion` 动效降级
- 可预览的一页式 `resume.pdf`
- 自动构建并发布到 `gh-pages` 的 GitHub Actions

## 本地开发

```powershell
npm install
npm run dev
```

常用质量检查：

```powershell
npm run lint
npm run test
npm run build
npm run test:e2e
```

## 修改个人资料

主页中的姓名、简介、社交地址、项目与 Notes 数据集中在：

```text
src/data/site.ts
```

简历的可编辑源文件与生成结果位于：

```text
public/resume.html
public/resume.pdf
```

修改 `resume.html` 后，可在 Chrome 中重新打印为 A4 PDF，并覆盖
`public/resume.pdf`。

## GitHub Pages 部署

工作流监听 `main` 和 `master` 分支。代码推送后会依次执行：

1. `npm ci`
2. `npm run lint`
3. `npm run test`
4. `npm run build`
5. 将 `dist` 发布到 `gh-pages` 分支

仓库首次上线时，在 `Settings -> Pages` 中把发布源设置为
`Deploy from a branch`，选择 `gh-pages / root`。

### 自定义域名

由于真实域名属于部署环境配置，仓库不会提交伪造的 `CNAME`。

1. 在仓库 `Settings -> Secrets and variables -> Actions -> Variables` 中创建
   `CUSTOM_DOMAIN`，值为你的真实域名。
2. 工作流会在构建前自动生成 `public/CNAME`，并确保最终
   `dist/CNAME` 被发布。
3. 也可以复制 `public/CNAME.example` 为 `public/CNAME`，再填入真实域名。
4. 完成 DNS 配置后，在 GitHub Pages 中开启 `Enforce HTTPS`。

## 设计与资源

- `设计图.png`：原始视觉参考，未被修改。
- `src/assets/cosmic-hero.webp`：从设计稿中裁出的纯宇宙背景，不包含导航、文字和工具卡。
- 交互元素均为真实 DOM；设计图不会作为整页不可交互背景使用。

## 技术栈

- React 19
- TypeScript 5
- Vite 8
- Lucide React
- React Icons
- Vitest + Testing Library
- Playwright
