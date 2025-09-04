// Advanced Animation Utilities for React Portfolio
// Enhanced with performance optimizations and advanced effects

class PerformanceMonitor {
  constructor() {
    this.frameCount = 0
    this.lastTime = performance.now()
    this.fps = 60
  }

  update() {
    const now = performance.now()
    this.frameCount++

    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime))
      this.frameCount = 0
      this.lastTime = now
    }

    return this.fps
  }

  shouldReduceEffects() {
    return this.fps < 30
  }
}

const performanceMonitor = new PerformanceMonitor()

const EasingFunctions = {
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
  },
  easeInOutBack: (t) => {
    const c1 = 1.70158
    const c2 = c1 * 1.525
    return t < 0.5
      ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
      : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
  },
  easeInOutBounce: (t) => {
    const bounceOut = (t) => {
      if (t < 1 / 2.75) return 7.5625 * t * t
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375
    }
    return t < 0.5 ? (1 - bounceOut(1 - 2 * t)) / 2 : (1 + bounceOut(2 * t - 1)) / 2
  },
}

export class AnimationUtils {
  static createParticleSystem(containerId, options = {}) {
    const container = document.getElementById(containerId)
    if (!container) return

    const config = {
      particleCount: options.particleCount || 50,
      particleSize: options.particleSize || 2,
      speed: options.speed || 0.5,
      color: options.color || "#64ffda",
      connectionDistance: options.connectionDistance || 100,
      enableWebGL: options.enableWebGL !== false,
      maxFPS: options.maxFPS || 60,
      adaptiveQuality: options.adaptiveQuality !== false,
      ...options,
    }

    const particles = []
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    let animationId
    let lastFrameTime = 0
    const frameInterval = 1000 / config.maxFPS

    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "1"
    canvas.style.opacity = "0.8"
    container.appendChild(canvas)

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight

      particles.length = 0
      const adaptiveCount = config.adaptiveQuality
        ? Math.min(config.particleCount, Math.floor((canvas.width * canvas.height) / 10000))
        : config.particleCount

      for (let i = 0; i < adaptiveCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          size: Math.random() * config.particleSize + 1,
          opacity: Math.random() * 0.5 + 0.5,
          life: Math.random() * 100 + 100,
        })
      }
    }

    const animate = (currentTime) => {
      if (currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(animate)
        return
      }

      lastFrameTime = currentTime
      performanceMonitor.update()
      const shouldReduce = config.adaptiveQuality && performanceMonitor.shouldReduceEffects()

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        particle.x += particle.vx * (shouldReduce ? 0.5 : 1)
        particle.y += particle.vy * (shouldReduce ? 0.5 : 1)
        particle.life--

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.8
          particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.8
          particle.y = Math.max(0, Math.min(canvas.height, particle.y))
        }

        if (particle.life <= 0) {
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.life = Math.random() * 100 + 100
        }

        ctx.save()
        ctx.globalAlpha = particle.opacity
        ctx.shadowBlur = 10
        ctx.shadowColor = config.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = config.color
        ctx.fill()
        ctx.restore()

        if (!shouldReduce) {
          particles.slice(i + 1).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < config.connectionDistance) {
              const opacity = (1 - distance / config.connectionDistance) * 0.5
              ctx.save()
              ctx.globalAlpha = opacity
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = config.color
              ctx.lineWidth = 1
              ctx.stroke()
              ctx.restore()
            }
          })
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    animationId = requestAnimationFrame(animate)

    return {
      destroy: () => {
        if (animationId) cancelAnimationFrame(animationId)
        container.removeChild(canvas)
        window.removeEventListener("resize", resizeCanvas)
      },
      updateConfig: (newConfig) => {
        Object.assign(config, newConfig)
      },
    }
  }

  static typeWriter(element, text, speed = 100, options = {}) {
    if (!element) return

    const config = {
      showCursor: options.showCursor !== false,
      cursorChar: options.cursorChar || "|",
      cursorBlink: options.cursorBlink !== false,
      randomDelay: options.randomDelay || false,
      onComplete: options.onComplete || null,
      easing: options.easing || "linear",
      ...options,
    }

    let i = 0
    let isDestroyed = false
    element.innerHTML = ""

    if (config.showCursor) {
      const cursor = document.createElement("span")
      cursor.className = "typing-cursor"
      cursor.textContent = config.cursorChar
      cursor.style.cssText = `
        opacity: 1;
        animation: ${config.cursorBlink ? "blink 1s infinite" : "none"};
      `
      element.appendChild(cursor)
    }

    const type = () => {
      if (isDestroyed) return

      if (i < text.length) {
        const textNode = document.createTextNode(text.charAt(i))
        if (config.showCursor) {
          element.insertBefore(textNode, element.lastChild)
        } else {
          element.appendChild(textNode)
        }

        i++
        const delay = config.randomDelay ? speed + Math.random() * speed * 0.5 : speed
        setTimeout(type, delay)
      } else {
        if (config.showCursor && !config.cursorBlink) {
          element.removeChild(element.lastChild)
        }
        if (config.onComplete) config.onComplete()
      }
    }

    type()

    return {
      destroy: () => {
        isDestroyed = true
      },
    }
  }

  static observeElements(selector, animationClass = "animate-in", options = {}) {
    const elements = document.querySelectorAll(selector)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(animationClass)
            if (options.once !== false) {
              observer.unobserve(entry.target)
            }
          } else if (options.once === false) {
            entry.target.classList.remove(animationClass)
          }
        })
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "0px",
      },
    )

    elements.forEach((el) => observer.observe(el))
    return observer
  }

  static createMouseFollower(options = {}) {
    const config = {
      size: options.size || 20,
      color: options.color || "#64ffda",
      blur: options.blur || 15,
      delay: options.delay || 0.1,
      trailLength: options.trailLength || 5,
      magneticElements: options.magneticElements || [],
      ...options,
    }

    const followers = []
    let mouseX = 0,
      mouseY = 0
    let animationId

    for (let i = 0; i < config.trailLength; i++) {
      const follower = document.createElement("div")
      follower.className = `mouse-follower mouse-follower-${i}`
      const size = config.size * (1 - i * 0.1)
      const opacity = 1 - i * 0.15

      follower.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, ${config.color}${Math.floor(opacity * 255)
          .toString(16)
          .padStart(2, "0")}, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: ${9999 - i};
        filter: blur(${config.blur}px);
        transform: translate(-50%, -50%);
        transition: all 0.1s ease-out;
      `

      document.body.appendChild(follower)
      followers.push({
        element: follower,
        x: 0,
        y: 0,
        delay: i * 0.05,
      })
    }

    const updatePosition = () => {
      followers.forEach((follower, index) => {
        const targetX = index === 0 ? mouseX : followers[index - 1].x
        const targetY = index === 0 ? mouseY : followers[index - 1].y

        follower.x += (targetX - follower.x) * (0.2 - follower.delay)
        follower.y += (targetY - follower.y) * (0.2 - follower.delay)

        follower.element.style.left = follower.x + "px"
        follower.element.style.top = follower.y + "px"
      })

      animationId = requestAnimationFrame(updatePosition)
    }

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
    })

    updatePosition()

    return {
      destroy: () => {
        if (animationId) cancelAnimationFrame(animationId)
        followers.forEach((follower) => {
          document.body.removeChild(follower.element)
        })
      },
    }
  }

  static createFloatingElements(containerId, options = {}) {
    const container = document.getElementById(containerId)
    if (!container) return

    const config = {
      count: options.count || 5,
      shapes: options.shapes || ["circle", "square", "triangle"],
      colors: options.colors || ["#64ffda", "#ff00ff", "#ffff00"],
      size: options.size || { min: 20, max: 60 },
      speed: options.speed || { min: 0.5, max: 2 },
      ...options,
    }

    const elements = []

    for (let i = 0; i < config.count; i++) {
      const element = document.createElement("div")
      const shape = config.shapes[Math.floor(Math.random() * config.shapes.length)]
      const color = config.colors[Math.floor(Math.random() * config.colors.length)]
      const size = Math.random() * (config.size.max - config.size.min) + config.size.min

      element.className = `floating-element floating-${shape}`
      element.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color}40;
        border: 2px solid ${color};
        opacity: 0.6;
        pointer-events: none;
        z-index: 1;
      `

      if (shape === "circle") {
        element.style.borderRadius = "50%"
      } else if (shape === "triangle") {
        element.style.background = "transparent"
        element.style.borderLeft = `${size / 2}px solid transparent`
        element.style.borderRight = `${size / 2}px solid transparent`
        element.style.borderBottom = `${size}px solid ${color}40`
        element.style.width = "0"
        element.style.height = "0"
      }

      element.style.left = Math.random() * (container.offsetWidth - size) + "px"
      element.style.top = Math.random() * (container.offsetHeight - size) + "px"

      container.appendChild(element)
      elements.push({
        element,
        vx: (Math.random() - 0.5) * config.speed.max,
        vy: (Math.random() - 0.5) * config.speed.max,
        rotation: 0,
        rotationSpeed: (Math.random() - 0.5) * 2,
      })
    }

    const animate = () => {
      elements.forEach(({ element, vx, vy, rotation, rotationSpeed }) => {
        const rect = element.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        const newX = rect.left - containerRect.left + vx
        const newY = rect.top - containerRect.top + vy

        if (newX < 0 || newX > container.offsetWidth - rect.width) {
          vx *= -1
        }
        if (newY < 0 || newY > container.offsetHeight - rect.height) {
          vy *= -1
        }

        element.style.left = newX + "px"
        element.style.top = newY + "px"
        element.style.transform = `rotate(${rotation}deg)`

        rotation += rotationSpeed
      })

      requestAnimationFrame(animate)
    }

    animate()

    return {
      destroy: () => {
        elements.forEach(({ element }) => {
          container.removeChild(element)
        })
      },
    }
  }

  static smoothScrollTo(targetId, offset = 0, duration = 1000, easing = "easeInOutCubic") {
    const target = document.getElementById(targetId)
    if (!target) return

    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    let startTime = null

    const easingFunction = EasingFunctions[easing] || EasingFunctions.easeInOutCubic

    const animation = (currentTime) => {
      if (startTime === null) startTime = currentTime
      const timeElapsed = currentTime - startTime
      const progress = Math.min(timeElapsed / duration, 1)
      const easedProgress = easingFunction(progress)

      window.scrollTo(0, startPosition + distance * easedProgress)

      if (timeElapsed < duration) {
        requestAnimationFrame(animation)
      }
    }

    requestAnimationFrame(animation)
  }

  static createScrollProgress(options = {}) {
    const config = {
      color: options.color || "#64ffda",
      height: options.height || "3px",
      position: options.position || "top",
      ...options,
    }

    const progressBar = document.createElement("div")
    progressBar.className = "scroll-progress"
    progressBar.style.cssText = `
      position: fixed;
      ${config.position}: 0;
      left: 0;
      width: 0%;
      height: ${config.height};
      background: linear-gradient(90deg, ${config.color}, ${config.color}80);
      z-index: 9999;
      transition: width 0.1s ease;
      box-shadow: 0 0 10px ${config.color}80;
    `

    document.body.appendChild(progressBar)

    const updateProgress = () => {
      const scrollTop = window.pageYOffset
      const docHeight = document.body.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100
      progressBar.style.width = scrollPercent + "%"
    }

    window.addEventListener("scroll", updateProgress)

    return {
      destroy: () => {
        document.body.removeChild(progressBar)
        window.removeEventListener("scroll", updateProgress)
      },
    }
  }

  static glitchText(element, options = {}) {
    if (!element) return

    const config = {
      duration: options.duration || 2000,
      intensity: options.intensity || 0.1,
      ...options,
    }

    const originalText = element.textContent
    const chars = "!<>-_\\/[]{}—=+*^?#________"

    let interval
    let timeout

    const glitch = () => {
      let glitchedText = ""
      for (let i = 0; i < originalText.length; i++) {
        if (Math.random() < config.intensity) {
          glitchedText += chars[Math.floor(Math.random() * chars.length)]
        } else {
          glitchedText += originalText[i]
        }
      }
      element.textContent = glitchedText
    }

    interval = setInterval(glitch, 50)
    timeout = setTimeout(() => {
      clearInterval(interval)
      element.textContent = originalText
    }, config.duration)

    return {
      stop: () => {
        clearInterval(interval)
        clearTimeout(timeout)
        element.textContent = originalText
      },
    }
  }

  static createWaveAnimation(containerId, options = {}) {
    const container = document.getElementById(containerId)
    if (!container) return

    const config = {
      amplitude: options.amplitude || 30,
      frequency: options.frequency || 0.015,
      speed: options.speed || 0.03,
      color: options.color || "rgba(0, 245, 255, 0.3)",
      lineWidth: options.lineWidth || 1,
      ...options,
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    let animationId
    let time = 0

    canvas.style.position = "absolute"
    canvas.style.top = "0"
    canvas.style.left = "0"
    canvas.style.pointerEvents = "none"
    canvas.style.zIndex = "1"
    canvas.style.opacity = "0.4"
    container.appendChild(canvas)

    const resizeCanvas = () => {
      canvas.width = container.offsetWidth
      canvas.height = container.offsetHeight
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerY = canvas.height / 2

      ctx.beginPath()
      ctx.strokeStyle = config.color
      ctx.lineWidth = config.lineWidth
      ctx.shadowBlur = 5
      ctx.shadowColor = config.color

      for (let x = 0; x < canvas.width; x += 2) {
        const y = centerY + Math.sin(x * config.frequency + time) * config.amplitude
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
      time += config.speed
      animationId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    animate()

    return {
      destroy: () => {
        if (animationId) cancelAnimationFrame(animationId)
        container.removeChild(canvas)
        window.removeEventListener("resize", resizeCanvas)
      },
    }
  }
}

const injectAnimationStyles = () => {
  if (document.getElementById("animation-styles")) return

  const style = document.createElement("style")
  style.id = "animation-styles"
  style.textContent = `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.8; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideInUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .animate-in {
      animation: slideInUp 0.6s ease-out forwards;
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-pulse {
      animation: pulse 2s ease-in-out infinite;
    }
  `
  document.head.appendChild(style)
}

injectAnimationStyles()

export const {
  createParticleSystem,
  typeWriter,
  observeElements,
  createMouseFollower,
  createFloatingElements,
  smoothScrollTo,
  createScrollProgress,
  glitchText,
  createWaveAnimation,
} = AnimationUtils

export const initializeAnimations = (options = {}) => {
  const animations = {}

  if (options.scrollProgress !== false) {
    animations.scrollProgress = AnimationUtils.createScrollProgress({
      color: "#64ffda",
      height: "3px",
      ...options.scrollProgress,
    })
  }

  if (options.mouseFollower) {
    animations.mouseFollower = AnimationUtils.createMouseFollower({
      trailLength: 3,
      color: "#64ffda",
      ...options.mouseFollower,
    })
  }

  if (options.scrollAnimations !== false) {
    animations.scrollObserver = AnimationUtils.observeElements(
      ".animate-on-scroll",
      "animate-in",
      options.scrollAnimations,
    )
  }

  return animations
}
