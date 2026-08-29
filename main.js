import './style.css'

const nav = document.getElementById('nav')
const year = document.getElementById('current-year')
const waitlistForm = document.getElementById('waitlist-form')
const waitlistEmail = document.getElementById('waitlist-email')
const waitlistSubmit = document.getElementById('waitlist-submit')
const waitlistStatus = document.getElementById('waitlist-status')
const waitlistEndpoint = import.meta.env.VITE_WAITLIST_ENDPOINT?.trim()

year.textContent = String(new Date().getFullYear())

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60)
}, { passive: true })

const revealItems = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale')
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        revealObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.12 })
  revealItems.forEach(item => revealObserver.observe(item))
} else {
  revealItems.forEach(item => item.classList.add('visible'))
}

if (!waitlistEndpoint) {
  waitlistSubmit.disabled = true
  waitlistSubmit.textContent = 'Waitlist setup in progress'
  waitlistStatus.textContent = 'No email will be collected until Golt connects its waitlist service.'
}

waitlistForm.addEventListener('submit', async event => {
  event.preventDefault()
  waitlistStatus.className = 'form-status'

  if (!waitlistEndpoint) {
    waitlistStatus.textContent = 'The waitlist connection is not live yet.'
    return
  }

  if (!waitlistEmail.validity.valid) {
    waitlistStatus.textContent = 'Enter a valid email address.'
    waitlistStatus.classList.add('is-error')
    waitlistEmail.focus()
    return
  }

  waitlistSubmit.disabled = true
  waitlistSubmit.textContent = 'Joining…'
  waitlistStatus.textContent = ''

  try {
    const response = await fetch(waitlistEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: waitlistEmail.value.trim() }),
    })
    if (!response.ok) throw new Error(`waitlist request failed: ${response.status}`)

    waitlistForm.reset()
    waitlistStatus.textContent = 'You are on the list. We will keep you posted.'
    waitlistStatus.classList.add('is-success')
  } catch (error) {
    console.error(error)
    waitlistStatus.textContent = 'We could not add you right now. Please try again later.'
    waitlistStatus.classList.add('is-error')
  } finally {
    waitlistSubmit.disabled = false
    waitlistSubmit.textContent = 'Join the waitlist'
  }
})
