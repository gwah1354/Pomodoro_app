import { useState, useEffect, useRef } from "react"
import { createRainSound, createCafeSound, createFireplaceSound } from "../utils/ambientSounds"

const SoundSelector = ({ isFocusMode }) => {
  const [selectedSound, setSelectedSound] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  const sounds = [
    { id: 'rain', name: 'Rain', file: '/sounds/rain.mp3', icon: 'rain' },
    { id: 'cafe', name: 'Cafe', file: '/sounds/cafe.mp3', icon: 'cafe' },
    { id: 'fireplace', name: 'Fireplace', file: '/sounds/fireplace.mp3', icon: 'fireplace' }
  ]

  const RainIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 8C4 8 3 9 3 10C3 11 4 12 5 12C6 12 7 11 7 10C7 9 6 8 5 8V8Z" stroke="#5B4636" strokeWidth="1" strokeLinecap="round"/>
      <path d="M8 6C8 6 7 7 7 8C7 9 8 10 9 10C10 10 11 9 11 8C11 7 10 6 9 6V6Z" stroke="#5B4636" strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 7C12 7 11 8 11 9C11 10 12 11 13 11C14 11 15 10 15 9C15 8 14 7 13 7V7Z" stroke="#5B4636" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="5" cy="13" r="0.5" fill="#5B4636"/>
      <circle cx="9" cy="11" r="0.5" fill="#5B4636"/>
      <circle cx="13" cy="10" r="0.5" fill="#5B4636"/>
    </svg>
  )

  const CafeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 8H12V10H4V8Z" stroke="#5B4636" strokeWidth="1"/>
      <circle cx="6" cy="12" r="1" fill="#5B4636"/>
      <circle cx="10" cy="12" r="1" fill="#5B4636"/>
      <path d="M12 6V8H13C13.5 8 14 7.5 14 7C14 6.5 13.5 6 13 6H12Z" stroke="#5B4636" strokeWidth="1"/>
      <path d="M3 4C3 4 3.5 3.5 4 3.5C4.5 3.5 5 4 5 4.5C5 5 4.5 5.5 4 5.5C3.5 5.5 3 5 3 4.5V4Z" stroke="#5B4636" strokeWidth="0.5" opacity="0.6"/>
      <path d="M5 2C5 2 5.5 1.5 6 1.5C6.5 1.5 7 2 7 2.5C7 3 6.5 3.5 6 3.5C5.5 3.5 5 3 5 2.5V2Z" stroke="#5B4636" strokeWidth="0.5" opacity="0.6"/>
    </svg>
  )

  const FireplaceIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 14H12V16H4V14Z" stroke="#5B4636" strokeWidth="1"/>
      <path d="M6 12C6 12 6.5 11 7 11C7.5 11 8 11.5 8 12V14H6V12Z" stroke="#5B4636" strokeWidth="1"/>
      <path d="M8 12C8 12 8.5 11 9 11C9.5 11 10 11.5 10 12V14H8V12Z" stroke="#5B4636" strokeWidth="1"/>
      <path d="M7 9C7 8 7.5 7 8 7C8.5 7 9 8 9 9" stroke="#5B4636" strokeWidth="1" strokeLinecap="round"/>
      <path d="M7 6C7 5.5 7.5 5 8 5C8.5 5 9 5.5 9 6" stroke="#5B4636" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  )

  const getIcon = (iconType) => {
    switch (iconType) {
      case 'rain': return <RainIcon />
      case 'cafe': return <CafeIcon />
      case 'fireplace': return <FireplaceIcon />
      default: return <RainIcon />
    }
  }

  const createAmbientSound = (soundType) => {
    try {
      console.log('Creating ambient sound for:', soundType)
      
      // Check if Web Audio API is available
      const AudioContext = window.AudioContext || window.webkitAudioContext
      if (!AudioContext) {
        console.error('Web Audio API not supported')
        return
      }
      
      const audioContext = new AudioContext()
      console.log('AudioContext created:', audioContext.state)
      
      let buffer
      switch (soundType) {
        case 'rain':
          buffer = createRainSound(audioContext)
          break
        case 'cafe':
          buffer = createCafeSound(audioContext)
          break
        case 'fireplace':
          buffer = createFireplaceSound(audioContext)
          break
        default:
          buffer = createRainSound(audioContext)
      }
      
      console.log('Buffer created:', buffer ? 'success' : 'failed')
      
      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()
      
      source.buffer = buffer
      source.loop = true
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      gainNode.gain.value = 0
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('AudioContext resumed')
          source.start(0)
        })
      } else {
        source.start(0)
      }
      
      // Store reference for volume control
      audioRef.current = {
        gainNode: gainNode,
        stop: () => source.stop(),
        volume: 0
      }
      
      if (isFocusMode) {
        fadeInAudio(audioRef.current, 0.3)
      } else {
        audioRef.current.gainNode.gain.value = 0.3
        audioRef.current.volume = 0.3
      }
      
      console.log(`Ambient sound created and started for ${soundType}`)
    } catch (error) {
      console.error('Could not create ambient sound:', error)
    }
  }

  const fadeInAudio = (audio, targetVolume = 0.3, duration = 1000) => {
    if (audio.gainNode) {
      // Ambient sound with gain node
      audio.gainNode.gain.value = 0
      const startTime = Date.now()
      
      const fade = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        audio.gainNode.gain.value = targetVolume * progress
        audio.volume = targetVolume * progress
        
        if (progress < 1) {
          requestAnimationFrame(fade)
        }
      }
      
      requestAnimationFrame(fade)
    } else {
      // Regular Audio object
      audio.volume = 0
      const startTime = Date.now()
      
      const fade = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        audio.volume = targetVolume * progress
        
        if (progress < 1) {
          requestAnimationFrame(fade)
        }
      }
      
      requestAnimationFrame(fade)
    }
  }

  const fadeOutAudio = (audio, duration = 1000) => {
    // Handle both Audio objects and ambient sound objects
    if (!audio) return
    
    const startVolume = audio.volume || 0.3
    const startTime = Date.now()
    
    const fade = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      if (audio.gainNode) {
        // Ambient sound with gain node
        audio.gainNode.gain.value = startVolume * (1 - progress)
        audio.volume = startVolume * (1 - progress)
        
        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          audio.stop()
        }
      } else if (audio.pause) {
        // Regular Audio object
        audio.volume = startVolume * (1 - progress)
        
        if (progress < 1) {
          requestAnimationFrame(fade)
        } else {
          audio.pause()
          audio.currentTime = 0
        }
      } else if (audio.stop) {
        // Fallback oscillator
        if (progress >= 1) {
          audio.stop()
        }
      }
    }
    
    requestAnimationFrame(fade)
  }

  const handleSoundSelect = (sound) => {
    console.log('Sound selected:', sound.name)
    
    // Stop current sound if playing
    if (audioRef.current) {
      console.log('Stopping current sound')
      fadeOutAudio(audioRef.current)
      audioRef.current = null
      setIsPlaying(false)
    }

    // If clicking the same sound that was playing, just stop it
    if (selectedSound === sound.id && isPlaying) {
      console.log('Same sound clicked, stopping')
      setSelectedSound(null)
      return
    }

    // Create a simple test tone first to ensure audio works
    const testTone = () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        // Different frequencies for different sounds
        const frequencies = {
          rain: 150,    // Low frequency for rain
          cafe: 300,     // Mid frequency for cafe
          fireplace: 200  // Low-mid frequency for fireplace (increased from 100Hz)
        }
        
        oscillator.frequency.value = frequencies[sound.id] || 200
        oscillator.type = 'sine'
        gainNode.gain.value = 0.1
        
        // Resume context if suspended
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            oscillator.start()
            console.log('Test tone started for', sound.id)
          })
        } else {
          oscillator.start()
          console.log('Test tone started for', sound.id)
        }
        
        // Store reference for cleanup
        audioRef.current = {
          gainNode: gainNode,
          stop: () => oscillator.stop(),
          volume: 0.1
        }
        
        if (isFocusMode) {
          fadeInAudio(audioRef.current, 0.2)
        } else {
          audioRef.current.gainNode.gain.value = 0.2
          audioRef.current.volume = 0.2
        }
        
        setIsPlaying(true)
        setSelectedSound(sound.id)
        
      } catch (error) {
        console.error('Could not create test tone:', error)
      }
    }
    
    // Try to load MP3 file first
    console.log('Trying to load MP3:', sound.file)
    const audio = new Audio(sound.file)
    audio.loop = true
    
    // Start test tone immediately
    testTone()
    
    // Try MP3 as backup
    audio.play().then(() => {
      console.log('MP3 loaded successfully')
      // Stop test tone and use MP3
      if (audioRef.current && audioRef.current.stop) {
        audioRef.current.stop()
      }
      audioRef.current = audio
      if (isFocusMode) {
        fadeInAudio(audio)
      } else {
        audio.volume = 0.3
      }
    }).catch((error) => {
      console.log(`Sound file not found: ${sound.file}. Using test tone...`)
      // Test tone is already playing, so we're good
    })
  }

  // Handle focus mode transitions
  useEffect(() => {
    if (audioRef.current) {
      if (isFocusMode) {
        fadeInAudio(audioRef.current)
      } else {
        fadeOutAudio(audioRef.current)
      }
    }
  }, [isFocusMode])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  return (
    <div className="fixed bottom-8 left-8 z-30">
      <div className="bg-[#F5F1E8] rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] backdrop-blur-sm p-4">
        <p className="text-sm font-medium text-gray-700 mb-3">Pick your vibe</p>
        <div className="flex flex-col gap-2">
          {sounds.map((sound) => (
            <button
              key={sound.id}
              onClick={() => handleSoundSelect(sound)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                selectedSound === sound.id 
                  ? 'bg-[#D6C2AF] ring-2 ring-[#5B4636] shadow-[0_8px_16px_rgba(0,0,0,0.12)]' 
                  : 'bg-[#E8E2D6] hover:bg-[#D8D2C6] shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)]'
              }`}
            >
              <span className="text-gray-700">
                {getIcon(sound.icon)}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {sound.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SoundSelector
