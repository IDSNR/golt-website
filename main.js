import './style.css'

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const signupUrl = 'https://your-link-here'

// ─── WHEEL CONFIG ─────────────────────────────────────────────────────────────
const SEGMENTS = [
  { label: '$200',  color: '#f0cb1f', textColor: '#090909' },
  { label: '$1',    color: '#4ccd62', textColor: '#090909' },
  { label: '$0.50', color: '#1a1a1a', textColor: '#ffffff', border: true },
  { label: '$1',    color: '#242424', textColor: '#f0cb1f', border: true },
]

// ─── SIGNUP LINKS ─────────────────────────────────────────────────────────────
document.querySelectorAll(
  '#nav-cta-btn, #hero-cta-btn, #wheel-cta-btn, #early-cta-btn, #closing-cta-btn'
).forEach(el => el.setAttribute('href', signupUrl))

// ─── NAV SCROLL ───────────────────────────────────────────────────────────────
const nav = document.getElementById('nav')
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60)
}, { passive: true })

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible')
      revealObserver.unobserve(e.target)
    }
  })
}, { threshold: 0.12 })

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale')
  .forEach(el => revealObserver.observe(el))

// ─── WHEEL DRAWING ────────────────────────────────────────────────────────────
function drawWheel(canvas, rotation = 0, size = canvas.width) {
  const ctx = canvas.getContext('2d')
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 4
  const sliceAngle = (2 * Math.PI) / SEGMENTS.length

  ctx.clearRect(0, 0, size, size)

  SEGMENTS.forEach((seg, i) => {
    const startAngle = rotation + i * sliceAngle
    const endAngle = startAngle + sliceAngle

    // Segment fill
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, startAngle, endAngle)
    ctx.closePath()
    ctx.fillStyle = seg.color
    ctx.fill()

    // Border accent
    if (seg.border) {
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Segment divider lines
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle))
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Label
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(startAngle + sliceAngle / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = seg.textColor
    ctx.font = `bold ${Math.round(size * 0.072)}px 'Space Mono', monospace`
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 4
    ctx.fillText(seg.label, r - size * 0.06, size * 0.026)
    ctx.restore()
  })

  // Center circle
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.1, 0, Math.PI * 2)
  ctx.fillStyle = '#090909'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Outer ring
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(240,203,31,0.3)'
  ctx.lineWidth = 3
  ctx.stroke()
}

// ─── MINI WHEEL (hero) ────────────────────────────────────────────────────────
const miniCanvas = document.getElementById('mini-wheel')
let miniAngle = 0
let miniAnimFrame

function animateMiniWheel() {
  miniAngle += 0.008
  drawWheel(miniCanvas, miniAngle, 220)
  miniAnimFrame = requestAnimationFrame(animateMiniWheel)
}
drawWheel(miniCanvas, 0, 220)
animateMiniWheel()

// ─── CLOSING WHEEL (decorative) ───────────────────────────────────────────────
const closingCanvas = document.getElementById('closing-wheel')
let closingAngle = 0
function animateClosingWheel() {
  closingAngle += 0.015
  drawWheel(closingCanvas, closingAngle, 120)
  requestAnimationFrame(animateClosingWheel)
}
drawWheel(closingCanvas, 0, 120)
animateClosingWheel()

// ─── MAIN WHEEL (interactive) ─────────────────────────────────────────────────
const mainCanvas = document.getElementById('main-wheel')
const spinBtn = document.getElementById('spin-btn')
const wheelResult = document.getElementById('wheel-result')
const resultValue = document.getElementById('result-value')

let mainAngle = 0
let isSpinning = false
let idleAnimFrame
let idleSpeed = 0.004

function drawMainWheel(angle) {
  drawWheel(mainCanvas, angle, 380)
}

// Idle slow rotation for main wheel
function idleRotate() {
  if (!isSpinning) {
    mainAngle += idleSpeed
    drawMainWheel(mainAngle)
    idleAnimFrame = requestAnimationFrame(idleRotate)
  }
}

// Increase idle speed as user scrolls into wheel section
const wheelSection = document.getElementById('wheel-section')
const wheelSpeedObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      idleSpeed = 0.012
      // Dramatic entry shake
      let shakeCount = 0
      const shakeInterval = setInterval(() => {
        idleSpeed = shakeCount % 2 === 0 ? 0.025 : 0.005
        shakeCount++
        if (shakeCount > 6) {
          clearInterval(shakeInterval)
          idleSpeed = 0.006
        }
      }, 180)
    } else {
      idleSpeed = 0.004
    }
  })
}, { threshold: 0.3 })
wheelSpeedObserver.observe(wheelSection)

drawMainWheel(0)
idleRotate()

// Spin logic
spinBtn.addEventListener('click', () => {
  if (isSpinning) return

  isSpinning = true
  spinBtn.disabled = true
  wheelResult.classList.remove('visible')
  cancelAnimationFrame(idleAnimFrame)

  const spinSegment = Math.floor(Math.random() * SEGMENTS.length)
  const sliceAngle = (2 * Math.PI) / SEGMENTS.length

  // Target: land pointer (top = -π/2) on chosen segment
  // Pointer is at top (-π/2). Segment i starts at mainAngle + i*sliceAngle
  // We want pointer at middle of chosen segment
  const targetSegCenter = spinSegment * sliceAngle + sliceAngle / 2
  // Pointer at top = -π/2. We need segment center to align with -π/2
  // So: mainAngle + targetSegCenter ≡ -π/2  (mod 2π)
  const extra = Math.PI * 2 * (6 + Math.random())   // several full rotations
  const currentNorm = mainAngle % (Math.PI * 2)
  const needed = (-Math.PI / 2 - targetSegCenter - currentNorm + Math.PI * 4) % (Math.PI * 2)
  const totalSpin = extra + needed

  const duration = 4200
  const startAngle = mainAngle
  const startTime = performance.now()

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4)
  }

  function spinFrame(now) {
    const elapsed = now - startTime
    const t = Math.min(elapsed / duration, 1)
    mainAngle = startAngle + totalSpin * easeOut(t)
    drawMainWheel(mainAngle)

    if (t < 1) {
      requestAnimationFrame(spinFrame)
    } else {
      isSpinning = false
      spinBtn.disabled = false

      resultValue.textContent = SEGMENTS[spinSegment].label
      wheelResult.classList.add('visible')

      // Resume idle after result shown
      setTimeout(() => {
        idleRotate()
      }, 3000)
    }
  }

  requestAnimationFrame(spinFrame)
})

// ─── SCROLL-BASED WHEEL SECTION ENTRANCE ──────────────────────────────────────
// Extra: pulse the spin button glow when section enters view
const spinBtnEl = document.getElementById('spin-btn')
const pulseObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      spinBtnEl.style.animation = 'spin-btn-glow 1.5s ease-in-out 3'
    }
  })
}, { threshold: 0.5 })
pulseObserver.observe(wheelSection)

// Inject spin button glow keyframe
const style = document.createElement('style')
style.textContent = `
  @keyframes spin-btn-glow {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: 0 0 32px rgba(240,203,31,0.6), 0 0 8px rgba(240,203,31,0.4); border-color: var(--yellow); }
  }
`
document.head.appendChild(style)
