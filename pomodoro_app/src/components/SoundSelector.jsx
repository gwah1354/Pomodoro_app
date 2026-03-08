import { useState, useEffect, useRef, useCallback } from "react"

// ─── Icon components (defined outside to avoid re-creation on each render) ──

const RainIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 6.5C3 4.5 4.5 3 6.5 3C7.2 3 7.8 3.2 8.3 3.6C8.8 2.7 9.8 2 11 2C12.7 2 14 3.3 14 5C14 5.1 14 5.2 14 5.3C14.6 5.6 15 6.3 15 7C15 8.1 14.1 9 13 9H4C3.4 9 3 8.6 3 8V6.5Z" stroke="#5B4636" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="5" y1="11" x2="4" y2="14" stroke="#5B4636" strokeWidth="1" strokeLinecap="round" />
    <line x1="8" y1="11" x2="7" y2="14" stroke="#5B4636" strokeWidth="1" strokeLinecap="round" />
    <line x1="11" y1="11" x2="10" y2="14" stroke="#5B4636" strokeWidth="1" strokeLinecap="round" />
  </svg>
)

const CafeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 5H11V12C11 12.6 10.6 13 10 13H4C3.4 13 3 12.6 3 12V5Z" stroke="#5B4636" strokeWidth="1" />
    <path d="M11 6H12.5C13.3 6 14 6.7 14 7.5C14 8.3 13.3 9 12.5 9H11" stroke="#5B4636" strokeWidth="1" strokeLinecap="round" />
    <path d="M5 3C5 3 5.3 2.5 6 2.5" stroke="#5B4636" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
    <path d="M7.5 2C7.5 2 7.8 1.5 8.5 1.5" stroke="#5B4636" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
  </svg>
)

const FireplaceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="12" width="14" height="2.5" rx="0.5" stroke="#5B4636" strokeWidth="1" />
    <path d="M4 12V9C4 7 5.5 6 6.5 7C6.5 7 6 5 7.5 4C7.5 4 7 6 8.5 6.5C8.5 6.5 8 4.5 9.5 3.5C9.5 3.5 9 6 10 7C10.5 7.5 11 8.5 11 9V12H4Z" stroke="#5B4636" strokeWidth="1" strokeLinejoin="round" />
  </svg>
)

const getIcon = (iconType) => {
  switch (iconType) {
    case "rain": return <RainIcon />
    case "cafe": return <CafeIcon />
    case "fireplace": return <FireplaceIcon />
    default: return <RainIcon />
  }
}

// ─── Sound definitions ────────────────────────────────────────────────────────

const SOUNDS = [
  { id: "rain", name: "Rain", file: "/sounds/rain.mp3" },
  { id: "cafe", name: "Cafe", file: "/sounds/cafe.mp3" },
  { id: "fireplace", name: "Fireplace", file: "/sounds/fireplace.mp3" },
]

// ─── Component ────────────────────────────────────────────────────────────────

const SoundSelector = ({ isFocusMode }) => {
  const [selectedSound, setSelectedSound] = useState(() =>
    localStorage.getItem("pomodoroSelectedSound") || null
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  // ─── Helpers ────────────────────────────────────────────────────────────

  const fadeIn = useCallback((audio, targetVolume = 0.3, duration = 1000) => {
    const startTime = Date.now()
    const fade = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      const vol = targetVolume * progress
      if (audio.gainNode) {
        audio.gainNode.gain.value = vol
        audio.volume = vol
      } else if (audio instanceof HTMLAudioElement) {
        audio.volume = vol
      }
      if (progress < 1) requestAnimationFrame(fade)
    }
    requestAnimationFrame(fade)
  }, [])

  const fadeOut = useCallback((audio, duration = 800) => {
    if (!audio) return
    const startVol = (audio.gainNode ? audio.gainNode.gain.value : audio.volume) || 0.3
    const startTime = Date.now()
    const fade = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      const vol = startVol * (1 - progress)
      if (audio.gainNode) {
        audio.gainNode.gain.value = vol
        audio.volume = vol
        if (progress >= 1) { try { audio.stop() } catch (_) { } }
      } else if (audio instanceof HTMLAudioElement) {
        audio.volume = vol
        if (progress >= 1) { audio.pause(); audio.currentTime = 0 }
      }
      if (progress < 1) requestAnimationFrame(fade)
    }
    requestAnimationFrame(fade)
  }, [])

  const stopCurrentAudio = useCallback(() => {
    if (!audioRef.current) return
    const a = audioRef.current
    audioRef.current = null
    // Safely handle both HTMLAudioElement and Web Audio objects
    if (typeof a.pause === "function") {
      a.pause()
      a.currentTime = 0
    } else if (typeof a.stop === "function") {
      try { a.stop() } catch (_) { }
    } else if (a.gainNode && typeof a.stop === "function") {
      try { a.stop() } catch (_) { }
    }
  }, [])

  // ─── Focus mode: fade in/out ─────────────────────────────────────────────

  useEffect(() => {
    if (!audioRef.current) return
    if (isFocusMode) {
      fadeIn(audioRef.current, 0.35)
    } else {
      // Fade to a lower but not zero volume when not in focus mode
      fadeIn(audioRef.current, 0.15)
    }
  }, [isFocusMode, fadeIn])

  // ─── Cleanup on unmount ───────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      const a = audioRef.current
      if (!a) return
      if (typeof a.pause === "function") a.pause()
      else if (a.gainNode) { try { a.stop() } catch (_) { } }
    }
  }, [])

  // ─── Handle sound selection ───────────────────────────────────────────────

  const handleSoundSelect = (sound) => {
    // Toggle off if same sound clicked while playing
    if (selectedSound === sound.id && isPlaying) {
      fadeOut(audioRef.current)
      audioRef.current = null
      setIsPlaying(false)
      setSelectedSound(null)
      localStorage.removeItem("pomodoroSelectedSound")
      return
    }

    // Stop previous sound
    fadeOut(audioRef.current)
    audioRef.current = null
    setIsPlaying(false)

    const audio = new Audio(sound.file)
    audio.loop = true
    audio.volume = 0

    audio.play()
      .then(() => {
        audioRef.current = audio
        const vol = isFocusMode ? 0.35 : 0.15
        fadeIn(audio, vol)
        setIsPlaying(true)
        setSelectedSound(sound.id)
        localStorage.setItem("pomodoroSelectedSound", sound.id)
      })
      .catch((err) => {
        console.warn("Could not play sound:", err)
        // Fallback oscillator
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)()
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.connect(gain)
          gain.connect(ctx.destination)
          const freqs = { rain: 150, cafe: 300, fireplace: 200 }
          osc.frequency.value = freqs[sound.id] || 200
          osc.type = "sine"
          gain.gain.value = 0
          if (ctx.state === "suspended") ctx.resume()
          osc.start()

          audioRef.current = {
            gainNode: gain,
            stop: () => { try { osc.stop() } catch (_) { } ctx.close() },
            volume: 0,
          }
          const vol = isFocusMode ? 0.25 : 0.12
          fadeIn(audioRef.current, vol)
          setIsPlaying(true)
          setSelectedSound(sound.id)
          localStorage.setItem("pomodoroSelectedSound", sound.id)
        } catch (e) {
          console.error("Oscillator fallback failed:", e)
        }
      })
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Desktop: fixed bottom-left panel */}
      <div className="hidden sm:block fixed bottom-6 left-6 z-30">
        <div className="bg-[#F5F1E8] rounded-xl shadow-[0_15px_35px_rgba(0,0,0,0.12)] backdrop-blur-sm p-4 min-w-[140px]">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Ambience
          </p>
          <div className="flex flex-col gap-2">
            {SOUNDS.map((sound) => (
              <button
                key={sound.id}
                onClick={() => handleSoundSelect(sound)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-105 ${selectedSound === sound.id
                    ? "bg-[#D6C2AF] ring-2 ring-[#5B4636] shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
                    : "bg-[#E8E2D6] hover:bg-[#D8D2C6] shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)]"
                  }`}
              >
                <span className="text-gray-700">{getIcon(sound.id)}</span>
                <span className="text-sm font-medium text-gray-700">{sound.name}</span>
                {selectedSound === sound.id && isPlaying && (
                  <span className="ml-auto flex gap-0.5 items-end h-3">
                    <span className="w-0.5 bg-[#5B4636] rounded-full animate-sound-bar1 h-2" />
                    <span className="w-0.5 bg-[#5B4636] rounded-full animate-sound-bar2 h-3" />
                    <span className="w-0.5 bg-[#5B4636] rounded-full animate-sound-bar3 h-1.5" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: bottom bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#F5F1E8] border-t border-[#E0D8CE] shadow-[0_-8px_20px_rgba(0,0,0,0.08)] px-4 py-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
          Ambience
        </p>
        <div className="flex justify-center gap-3">
          {SOUNDS.map((sound) => (
            <button
              key={sound.id}
              onClick={() => handleSoundSelect(sound)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${selectedSound === sound.id
                  ? "bg-[#D6C2AF] ring-2 ring-[#5B4636]"
                  : "bg-[#E8E2D6] hover:bg-[#D8D2C6]"
                }`}
            >
              <span className="text-gray-700">{getIcon(sound.id)}</span>
              <span className="text-xs font-medium text-gray-700">{sound.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

export default SoundSelector
