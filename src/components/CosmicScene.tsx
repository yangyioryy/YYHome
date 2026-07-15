import { useEffect, useRef } from 'react'

const createRandom = (seed: number) => {
  let value = seed >>> 0

  return () => {
    value += 0x6d2b79f5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

const cubicPoint = (
  start: number,
  controlA: number,
  controlB: number,
  end: number,
  progress: number,
) => {
  const inverse = 1 - progress

  return (
    inverse ** 3 * start +
    3 * inverse ** 2 * progress * controlA +
    3 * inverse * progress ** 2 * controlB +
    progress ** 3 * end
  )
}

const drawCosmos = (
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
) => {
  const context = canvas.getContext('2d')
  if (!context) return

  const ratio = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2)
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)

  const random = createRandom(20260715)
  const starCount = width < 768 ? 120 : Math.min(480, Math.round(width * 0.31))

  for (let index = 0; index < starCount; index += 1) {
    const x = random() * width
    const y = 30 + random() * height * 0.66
    const radius = 0.25 + random() * (random() > 0.94 ? 1.25 : 0.7)
    const alpha = 0.12 + random() * 0.68

    context.beginPath()
    context.fillStyle = `rgba(${150 + Math.round(random() * 85)}, ${185 + Math.round(
      random() * 55,
    )}, 255, ${alpha})`
    context.arc(x, y, radius, 0, Math.PI * 2)
    context.fill()
  }

  const drawParticleRibbon = (mirror: boolean) => {
    const particleCount = width < 768 ? 360 : Math.min(1500, Math.round(width * 0.88))
    const direction = mirror ? -1 : 1
    const startX = mirror ? width * 0.92 : width * 0.08
    const endX = mirror ? width * 0.56 : width * 0.44

    for (let index = 0; index < particleCount; index += 1) {
      const progress = random()
      const spread = (random() - 0.5) * (1 - progress) * height * 0.14
      const x = cubicPoint(
        startX,
        startX + direction * width * 0.06,
        endX - direction * width * 0.18,
        endX,
        progress,
      )
      const y =
        cubicPoint(
          height * (0.15 + random() * 0.11),
          height * 0.42,
          height * 0.54,
          height * 0.585,
          progress,
        ) + spread
      const radius = 0.3 + random() * 0.95
      const alpha = (0.06 + progress * 0.58) * (0.45 + random() * 0.55)

      context.beginPath()
      context.fillStyle = `rgba(102, 163, 255, ${alpha})`
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }
  }

  drawParticleRibbon(false)
  drawParticleRibbon(true)

  const horizonDust = width < 768 ? 90 : 260
  for (let index = 0; index < horizonDust; index += 1) {
    const offset = (random() - 0.5) * width * 0.78
    const x = width / 2 + offset
    const y = height * 0.59 + Math.abs(offset / width) * height * 0.08 + random() * 18
    const alpha = (1 - Math.abs(offset) / (width * 0.42)) * (0.1 + random() * 0.45)

    if (alpha <= 0) continue
    context.fillStyle = `rgba(132, 184, 255, ${alpha})`
    context.fillRect(x, y, 0.5 + random() * 1.2, 0.5 + random() * 1.2)
  }
}

export function CosmicScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = canvas?.parentElement
    if (!canvas || !host) return undefined

    let resizeTimer = 0
    const redraw = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        drawCosmos(canvas, host.clientWidth, host.clientHeight)
      }, 100)
    }

    drawCosmos(canvas, host.clientWidth, host.clientHeight)
    const observer = new ResizeObserver(redraw)
    observer.observe(host)

    return () => {
      window.clearTimeout(resizeTimer)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="cosmic-scene" aria-hidden="true">
      <div className="cosmic-image" />
      <div className="cosmic-nebula" />
      <canvas ref={canvasRef} className="cosmic-canvas" />
      <svg className="orbit-field" viewBox="0 0 1200 650" preserveAspectRatio="none">
        <g className="orbit-group">
          <ellipse className="orbit orbit-primary" cx="600" cy="300" rx="360" ry="118" />
          <ellipse className="orbit orbit-secondary" cx="610" cy="360" rx="285" ry="82" />
          <circle className="orbit-node orbit-node-blue" cx="355" cy="254" r="6" />
          <circle className="orbit-node orbit-node-white" cx="760" cy="188" r="8" />
          <circle className="orbit-node orbit-node-small" cx="948" cy="292" r="3" />
        </g>
      </svg>
      <span className="shooting-star shooting-star-one" />
      <span className="shooting-star shooting-star-two" />
      <div className="planet">
        <div className="planet-texture" />
      </div>
      <div className="horizon-flare" />
    </div>
  )
}
