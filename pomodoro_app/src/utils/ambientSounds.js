// Create ambient rain sound using Web Audio API
export const createRainSound = (audioContext) => {
  const duration = 10 // 10 second loop
  const sampleRate = audioContext.sampleRate
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate)
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel)
    
    for (let i = 0; i < channelData.length; i++) {
      // Create rain-like noise with filtering
      let sample = 0
      
      // Add white noise for rain drops
      for (let j = 0; j < 3; j++) {
        const dropTime = (i + j * sampleRate / 3) % sampleRate
        const noise = (Math.random() - 0.5) * 0.1
        sample += noise * Math.exp(-Math.abs(dropTime - sampleRate / 2) / (sampleRate / 10))
      }
      
      // Low pass filter for muffled rain sound
      const filtered = sample * 0.3 + (channelData[i - 1] || 0) * 0.7
      channelData[i] = filtered * 0.2 // Low volume
    }
  }
  
  return buffer
}

// Create cafe ambient sound
export const createCafeSound = (audioContext) => {
  const duration = 8 // 8 second loop
  const sampleRate = audioContext.sampleRate
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate)
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel)
    
    for (let i = 0; i < channelData.length; i++) {
      let sample = 0
      
      // Background murmur (low frequency noise)
      const murmur = (Math.random() - 0.5) * 0.05
      sample += murmur
      
      // Occasional clatter (coffee cup sounds)
      if (Math.random() < 0.001) {
        const clatter = Math.sin(i * 0.1) * 0.1 * Math.exp(-Math.random() * 0.1)
        sample += clatter
      }
      
      // Low rumble (refrigerator, AC)
      const rumble = Math.sin(i * 0.002) * 0.02
      sample += rumble
      
      channelData[i] = sample * 0.3
    }
  }
  
  return buffer
}

// Create fireplace crackling sound
export const createFireplaceSound = (audioContext) => {
  const duration = 6 // 6 second loop
  const sampleRate = audioContext.sampleRate
  const buffer = audioContext.createBuffer(2, duration * sampleRate, sampleRate)
  
  for (let channel = 0; channel < 2; channel++) {
    const channelData = buffer.getChannelData(channel)
    
    for (let i = 0; i < channelData.length; i++) {
      let sample = 0
      
      // Low rumble (fire burning)
      const rumble = (Math.random() - 0.5) * 0.08
      sample += rumble
      
      // Occasional crackles
      if (Math.random() < 0.002) {
        const crackle = (Math.random() - 0.5) * 0.3 * Math.exp(-Math.random() * 0.05)
        sample += crackle
      }
      
      // Hissing sound
      const hiss = Math.sin(i * 0.05 + Math.random() * 0.1) * 0.02
      sample += hiss
      
      // Low pass filter for muffled fire sound
      const filtered = sample * 0.4 + (channelData[i - 1] || 0) * 0.6
      channelData[i] = filtered * 0.25
    }
  }
  
  return buffer
}
