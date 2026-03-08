// Simple completion sound effect
// This creates a basic notification sound using Web Audio API

export const playCompletionSound = () => {
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configure sound
    oscillator.frequency.value = 800 // 800 Hz tone
    oscillator.type = 'sine'
    gainNode.gain.value = 0.3 // Volume
    
    // Play sound
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1) // 100ms duration
    
    console.log('Completion sound played')
  } catch (error) {
    console.log('Error playing sound:', error)
  }
}
