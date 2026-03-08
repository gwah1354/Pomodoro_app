// Simple completion sound effect
// Plays confetti pop followed by soft chime when timer completes

export const playCompletionSound = () => {
  try {
    const pop = new Audio("/sounds/confetti-pop.mp3?ts=" + Date.now())
    pop.volume = 0.7
    pop.play().catch(() => {})

    setTimeout(() => {
      const chime = new Audio("/sounds/soft-chime.mp3?ts=" + Date.now())
      chime.volume = 0.6
      chime.play().catch(() => {})
    }, 500)
  } catch (error) {
    console.warn("Completion sound failed", error)
  }
}
