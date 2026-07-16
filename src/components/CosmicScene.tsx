import { useEffect, useRef } from 'react'

type EffectParticle = {
  x: number
  y: number
  previousX: number
  previousY: number
  velocityX: number
  velocityY: number
  radius: number
  age: number
  lifetime: number
}

type EffectRipple = {
  x: number
  y: number
  age: number
  lifetime: number
  maxRadius: number
}

type EffectFlash = {
  x: number
  y: number
  age: number
  lifetime: number
}

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

const drawCosmos = (canvas: HTMLCanvasElement, width: number, height: number) => {
  const context = canvas.getContext('2d')
  if (!context) return

  const ratio = Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2)
  canvas.width = Math.round(width * ratio)
  canvas.height = Math.round(height * ratio)
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  context.setTransform(ratio, 0, 0, ratio, 0, 0)
  context.clearRect(0, 0, width, height)

  const random = createRandom(20260715)
  const starCount = width < 768 ? 120 : Math.min(480, Math.round(width * 0.31))

  for (let index = 0; index < starCount; index += 1) {
    const x = random() * width
    const y = 30 + random() * height * 0.66
    const radius = 0.25 + random() * (random() > 0.94 ? 1.25 : 0.7)
    const alpha = 0.12 + random() * 0.68
    const red = 150 + Math.round(random() * 85)
    const green = 185 + Math.round(random() * 55)

    context.beginPath()
    context.fillStyle = 'rgba(' + red + ', ' + green + ', 255, ' + alpha + ')'
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
      context.fillStyle = 'rgba(102, 163, 255, ' + alpha + ')'
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
    context.fillStyle = 'rgba(132, 184, 255, ' + alpha + ')'
    context.fillRect(x, y, 0.5 + random() * 1.2, 0.5 + random() * 1.2)
  }
}

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3

export function CosmicScene() {
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null)
  const effectsCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current
    const effectsCanvas = effectsCanvasRef.current
    const host = backgroundCanvas?.parentElement
    if (!backgroundCanvas || !effectsCanvas || !host) return undefined

    const effectsContext = effectsCanvas.getContext('2d')
    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null

    let particles: EffectParticle[] = []
    let ripples: EffectRipple[] = []
    let flashes: EffectFlash[] = []
    let animationFrame = 0
    let resizeTimer = 0
    let lastFrameTime = 0
    let effectWidth = 1
    let effectHeight = 1
    let effectRatio = 1
    let reduceMotion = motionQuery?.matches ?? false

    const resizeEffectsCanvas = () => {
      if (!effectsContext) return

      effectWidth = Math.max(host.clientWidth, 1)
      effectHeight = Math.max(host.clientHeight, 1)
      effectRatio = Math.min(window.devicePixelRatio || 1, effectWidth < 768 ? 1.5 : 2)

      const pixelWidth = Math.round(effectWidth * effectRatio)
      const pixelHeight = Math.round(effectHeight * effectRatio)
      if (effectsCanvas.width !== pixelWidth || effectsCanvas.height !== pixelHeight) {
        effectsCanvas.width = pixelWidth
        effectsCanvas.height = pixelHeight
      }

      effectsCanvas.style.width = effectWidth + 'px'
      effectsCanvas.style.height = effectHeight + 'px'
      effectsContext.setTransform(effectRatio, 0, 0, effectRatio, 0, 0)
    }

    const clearEffectsCanvas = () => {
      if (!effectsContext) return
      effectsContext.setTransform(effectRatio, 0, 0, effectRatio, 0, 0)
      effectsContext.clearRect(0, 0, effectWidth, effectHeight)
    }

    const drawEffectFrame = (timestamp: number) => {
      if (!effectsContext) {
        animationFrame = 0
        return
      }

      const delta = lastFrameTime === 0 ? 16 : Math.min(timestamp - lastFrameTime, 34)
      const deltaSeconds = delta / 1000
      lastFrameTime = timestamp

      clearEffectsCanvas()
      effectsContext.globalCompositeOperation = 'lighter'
      effectsContext.lineCap = 'round'

      flashes = flashes.filter((flash) => {
        flash.age += delta
        if (flash.age >= flash.lifetime) return false

        const progress = flash.age / flash.lifetime
        const radius = 22 + easeOutCubic(progress) * 74
        const alpha = (1 - progress) * 0.72
        const gradient = effectsContext.createRadialGradient(
          flash.x,
          flash.y,
          0,
          flash.x,
          flash.y,
          radius,
        )
        gradient.addColorStop(0, 'rgba(255, 255, 255, ' + alpha + ')')
        gradient.addColorStop(0.18, 'rgba(132, 196, 255, ' + alpha * 0.7 + ')')
        gradient.addColorStop(1, 'rgba(68, 126, 255, 0)')

        effectsContext.fillStyle = gradient
        effectsContext.beginPath()
        effectsContext.arc(flash.x, flash.y, radius, 0, Math.PI * 2)
        effectsContext.fill()

        effectsContext.save()
        effectsContext.translate(flash.x, flash.y)
        effectsContext.rotate(progress * 0.8)
        effectsContext.strokeStyle = 'rgba(162, 210, 255, ' + alpha * 0.68 + ')'
        effectsContext.lineWidth = 1.2
        for (let ray = 0; ray < 6; ray += 1) {
          effectsContext.rotate(Math.PI / 3)
          effectsContext.beginPath()
          effectsContext.moveTo(9, 0)
          effectsContext.lineTo(28 + progress * 48, 0)
          effectsContext.stroke()
        }
        effectsContext.restore()

        return true
      })

      ripples = ripples.filter((ripple) => {
        ripple.age += delta
        if (ripple.age < 0) return true
        if (ripple.age >= ripple.lifetime) return false

        const progress = ripple.age / ripple.lifetime
        const radius = 8 + easeOutCubic(progress) * ripple.maxRadius
        const alpha = (1 - progress) ** 1.8

        effectsContext.beginPath()
        effectsContext.strokeStyle = 'rgba(100, 174, 255, ' + alpha * 0.82 + ')'
        effectsContext.lineWidth = 0.8 + (1 - progress) * 1.8
        effectsContext.arc(ripple.x, ripple.y, radius, 0, Math.PI * 2)
        effectsContext.stroke()

        return true
      })

      effectsContext.shadowColor = 'rgba(85, 158, 255, 0.68)'
      effectsContext.shadowBlur = 8
      particles = particles.filter((particle) => {
        particle.age += delta
        if (particle.age >= particle.lifetime) return false

        particle.previousX = particle.x
        particle.previousY = particle.y
        particle.x += particle.velocityX * deltaSeconds
        particle.y += particle.velocityY * deltaSeconds

        const drag = Math.pow(0.982, delta / 16)
        particle.velocityX *= drag
        particle.velocityY = particle.velocityY * drag + 16 * deltaSeconds

        const progress = particle.age / particle.lifetime
        const alpha = (1 - progress) ** 1.45

        effectsContext.beginPath()
        effectsContext.strokeStyle = 'rgba(104, 184, 255, ' + alpha * 0.8 + ')'
        effectsContext.lineWidth = Math.max(0.6, particle.radius * 0.72)
        effectsContext.moveTo(particle.previousX, particle.previousY)
        effectsContext.lineTo(particle.x, particle.y)
        effectsContext.stroke()

        effectsContext.beginPath()
        effectsContext.fillStyle = 'rgba(218, 239, 255, ' + alpha + ')'
        effectsContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        effectsContext.fill()

        return true
      })
      effectsContext.shadowBlur = 0
      effectsContext.globalCompositeOperation = 'source-over'

      if (particles.length > 0 || ripples.length > 0 || flashes.length > 0) {
        animationFrame = window.requestAnimationFrame(drawEffectFrame)
      } else {
        animationFrame = 0
        lastFrameTime = 0
      }
    }

    const startEffectAnimation = () => {
      if (animationFrame !== 0 || !effectsContext) return
      lastFrameTime = 0
      animationFrame = window.requestAnimationFrame(drawEffectFrame)
    }

    const createBurst = (x: number, y: number) => {
      const compact = effectWidth < 768
      const particleCount = compact ? 20 : 36
      const particleLimit = compact ? 72 : 140

      for (let index = 0; index < particleCount; index += 1) {
        const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.24
        const speed = (compact ? 105 : 145) + Math.random() * (compact ? 105 : 175)

        particles.push({
          x,
          y,
          previousX: x,
          previousY: y,
          velocityX: Math.cos(angle) * speed,
          velocityY: Math.sin(angle) * speed,
          radius: 0.8 + Math.random() * (compact ? 1.4 : 1.8),
          age: 0,
          lifetime: 540 + Math.random() * 360,
        })
      }

      if (particles.length > particleLimit) {
        particles.splice(0, particles.length - particleLimit)
      }

      const maxRadius = compact ? 92 : 152
      ripples.push(
        { x, y, age: 0, lifetime: 720, maxRadius },
        { x, y, age: -105, lifetime: 820, maxRadius: maxRadius * 1.18 },
      )
      flashes.push({ x, y, age: 0, lifetime: 390 })
      startEffectAnimation()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!effectsContext || reduceMotion || event.button !== 0 || event.isPrimary === false) return

      const bounds = host.getBoundingClientRect()
      createBurst(event.clientX - bounds.left, event.clientY - bounds.top)
    }

    const redraw = () => {
      resizeEffectsCanvas()
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        drawCosmos(backgroundCanvas, host.clientWidth, host.clientHeight)
      }, 100)
    }

    const handleMotionChange = (event: MediaQueryListEvent) => {
      reduceMotion = event.matches
      if (!reduceMotion) return

      particles = []
      ripples = []
      flashes = []
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      lastFrameTime = 0
      clearEffectsCanvas()
    }

    const handleVisibilityChange = () => {
      if (!document.hidden) return

      particles = []
      ripples = []
      flashes = []
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame)
      animationFrame = 0
      lastFrameTime = 0
      clearEffectsCanvas()
    }

    drawCosmos(backgroundCanvas, host.clientWidth, host.clientHeight)
    resizeEffectsCanvas()

    const observer = new ResizeObserver(redraw)
    observer.observe(host)
    host.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    motionQuery?.addEventListener('change', handleMotionChange)

    return () => {
      window.clearTimeout(resizeTimer)
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame)
      observer.disconnect()
      host.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      motionQuery?.removeEventListener('change', handleMotionChange)
    }
  }, [])

  return (
    <div className="cosmic-scene" aria-hidden="true">
      <div className="cosmic-image" />
      <div className="cosmic-nebula" />
      <canvas ref={backgroundCanvasRef} className="cosmic-canvas" />
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
      <canvas ref={effectsCanvasRef} className="effects-canvas" />
    </div>
  )
}
