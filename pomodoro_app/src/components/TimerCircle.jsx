import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CustomTimePicker from "./CustomTimePicker"
import confetti from "canvas-confetti"
import { playCompletionSound } from "../utils/completionSound"

function TimerCircle({ isFocusMode, onFocusModeChange, onCompletion, onReset, onModeChange }) {

  // ─── Persisted defaults ────────────────────────────────────────────────────
  const savedDuration = parseInt(localStorage.getItem("pomodoroLastDuration") || String(25 * 60), 10)

  // ─── Timer state ───────────────────────────────────────────────────────────
  const [totalTime, setTotalTime] = useState(savedDuration)
  const [timeLeft, setTimeLeft] = useState(savedDuration)
  const [isRunning, setIsRunning] = useState(false)
  const [endTime, setEndTime] = useState(null)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [timeKey, setTimeKey] = useState(0)

  // ─── Break mode state ──────────────────────────────────────────────────────
  const [mode, setMode] = useState("focus") // "focus" | "short-break" | "long-break"

  const modeDurations = {
    "focus": totalTime,
    "short-break": 5 * 60,
    "long-break": 15 * 60,
  }

  const modeLabels = {
    "focus": "Focus",
    "short-break": "Short Break",
    "long-break": "Long Break",
  }

  // ─── SVG geometry (larger circle for prominent timer) ──────────────────────
  const radius = 140
  const stroke = 8
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius

  const currentDuration = modeDurations[mode]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  // ─── Smooth ring: CSS animation using endTime for true continuousness ──────
  // Instead of stepping strokeDashoffset on each tick, we set a CSS transition
  // that animates from current to target over the remaining time in one sweep.
  const [ringOffset, setRingOffset] = useState(0) // 0 = full ring (not started)
  const [ringTransitionDuration, setRingTransitionDuration] = useState(0) // seconds

  // Sync ring offset whenever timer state changes meaningfully
  useEffect(() => {
    if (currentDuration <= 0) return
    const progress = timeLeft / currentDuration
    const targetOffset = circumference * (1 - progress)

    if (isRunning && timeLeft > 0) {
      // Set transition to sweep the rest of the arc over the exact remaining time
      setRingTransitionDuration(timeLeft)
      setRingOffset(circumference) // animate to fully depleted
    } else {
      // Paused / reset: snap to current progress instantly
      setRingTransitionDuration(0.5)
      setRingOffset(targetOffset)
    }
  }, [isRunning, timeLeft, currentDuration, circumference])

  // ─── Interval ref (wall-clock corrected) ───────────────────────────────────
  const intervalRef = useRef(null)
  const endTimeRef = useRef(null)

  // ─── Presets ───────────────────────────────────────────────────────────────
  const presets = [
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "25 min", value: 25 },
    { label: "45 min", value: 45 },
  ]

  // ─── Completion messages ───────────────────────────────────────────────────
  const focusMessages = [
    "Nice work. You completed your focus session.",
    "Well done. You stayed focused.",
    "Session complete. Take a short break.",
  ]
  const breakMessages = [
    "Break over. Ready to focus again?",
    "Refreshed? Let's get back to it.",
    "Break complete. Time to work!",
  ]

  // ─── Tab title countdown ───────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      document.title = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")} — ${modeLabels[mode]}`
    } else {
      document.title = "Focus Timer"
    }
    return () => { document.title = "Focus Timer" }
  }, [isRunning, timeLeft, mode])

  // ─── Wall-clock corrected tick ─────────────────────────────────────────────
  const startInterval = useCallback((end) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((end - Date.now()) / 1000)
      if (remaining <= 0) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setTimeLeft(0)
      } else {
        setTimeLeft(remaining)
      }
    }, 500)
  }, [])

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // ─── Completion handler ────────────────────────────────────────────────────
  const handleCompletion = useCallback(() => {
    stopInterval()
    setIsRunning(false)
    setEndTime(null)
    onFocusModeChange(false)

    playCompletionSound()
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E8D5C4", "#D6C2AF", "#CBB39C", "#F5F1E8"],
    })

    const pool = mode === "focus" ? focusMessages : breakMessages
    const msg = pool[Math.floor(Math.random() * pool.length)]
    if (onCompletion) onCompletion(msg)

    // Reset ring and timer to start of same mode
    const dur = modeDurations[mode]
    setTimeLeft(dur)
    setRingOffset(0)
    setRingTransitionDuration(0)
    setTimeKey((k) => k + 1)
  }, [mode, stopInterval, onFocusModeChange, onCompletion])

  // ─── Watch for zero ────────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      handleCompletion()
    }
  }, [timeLeft, isRunning, handleCompletion])

  // ─── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => stopInterval()
  }, [stopInterval])

  // ─── Event handlers ────────────────────────────────────────────────────────
  const handleStartPause = () => {
    if (!isRunning && timeLeft > 0) {
      if (onReset) onReset()
      const end = Date.now() + timeLeft * 1000
      endTimeRef.current = end
      setEndTime(new Date(end))
      onFocusModeChange(true)
      startInterval(end)
      // Ring will sweep continuously via the useEffect above
    } else {
      // Pausing: snap ring to current position
      stopInterval()
      setEndTime(null)
      onFocusModeChange(false)
    }
    setIsRunning((r) => !r)
  }

  const handleCancel = () => {
    stopInterval()
    setIsRunning(false)
    setEndTime(null)
    onFocusModeChange(false)
    if (onReset) onReset()
    const dur = modeDurations[mode]
    setTimeLeft(dur)
    setRingOffset(0)
    setRingTransitionDuration(0)
    setTimeKey((k) => k + 1)
  }

  const applyDuration = (newTotalSeconds, newMode = "focus") => {
    stopInterval()
    setIsRunning(false)
    setEndTime(null)
    onFocusModeChange(false)
    if (onReset) onReset()
    const newModeFinal = newMode
    setMode(newModeFinal)
    if (onModeChange) onModeChange(newModeFinal)
    if (newModeFinal === "focus") {
      setTotalTime(newTotalSeconds)
      localStorage.setItem("pomodoroLastDuration", String(newTotalSeconds))
    }
    setTimeLeft(newTotalSeconds)
    setRingOffset(0)
    setRingTransitionDuration(0)
    setTimeKey((k) => k + 1)
  }

  const handlePresetClick = (mins) => applyDuration(mins * 60, "focus")
  const handleCustomTimeSelect = (mins) => applyDuration(mins * 60, "focus")
  const handleModeSwitch = (newMode) => {
    applyDuration(modeDurations[newMode], newMode)
  }

  const formatEndTime = (date) =>
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })

  // SVG size — larger ring, responsive via viewBox
  const svgViewBox = radius * 2
  const svgSize = "min(300px, 70vw)"

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div layout className="flex flex-col items-center gap-4 w-full" transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}>

      {/* Mode switcher tabs — fade out during focus mode */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex gap-2"
          >
            {Object.entries(modeLabels).map(([key, label]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleModeSwitch(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${mode === key
                  ? "bg-[#C8B6A6] text-gray-800 shadow-[0_4px_10px_rgba(0,0,0,0.10)]"
                  : "bg-[#E8E2D6] text-gray-600 hover:bg-[#D8D2C6]"
                  }`}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer row — ring + flanking buttons */}
      <motion.div
        layout
        className="flex items-center justify-center gap-4 sm:gap-10"
        animate={{ scale: isFocusMode ? 1.06 : 1 }}
        transition={{ layout: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }, scale: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } }}
      >
        {/* Start / Pause button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStartPause}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D6C2AF] flex items-center justify-center text-gray-800 font-medium hover:bg-[#cbb39c] transition-all duration-200 shadow-[0_8px_18px_rgba(0,0,0,0.10)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.14)] text-sm flex-shrink-0"
        >
          {!isRunning && timeLeft === modeDurations[mode] ? "Start" : isRunning ? "Pause" : "Resume"}
        </motion.button>

        {/* SVG ring — no wrapping box, shadow on the ring itself */}
        <svg
          height={svgSize}
          width={svgSize}
          viewBox={`0 0 ${svgViewBox} ${svgViewBox}`}
          style={{
            filter: "drop-shadow(0px 16px 40px rgba(0,0,0,0.13)) drop-shadow(0px 4px 12px rgba(0,0,0,0.08))",
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          {/* Track ring */}
          <circle
            stroke="#E0D9CE"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          {/* Progress arc — always beige/brown, smooth CSS transition  */}
          <circle
            stroke="#5B4636"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={ringOffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              // Single continuous CSS transition — the key to smooth ring progression
              transition: `stroke-dashoffset ${ringTransitionDuration}s linear`,
              // Soft glow while running
              filter: isRunning
                ? "drop-shadow(0 0 6px rgba(91,70,54,0.30))"
                : "none",
            }}
          />

          {/* Timer text — large and prominent */}
          <AnimatePresence mode="wait">
            <motion.text
              key={timeKey}
              x="50%"
              y="47%"
              dominantBaseline="central"
              textAnchor="middle"
              fill="#3D3028"
              fontWeight="300"
              style={{
                fontSize: "54px",
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
                letterSpacing: "1px",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </motion.text>
          </AnimatePresence>
        </svg>

        {/* Cancel button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCancel}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#D6C2AF] flex items-center justify-center text-gray-800 font-medium hover:bg-[#cbb39c] transition-all duration-200 shadow-[0_8px_18px_rgba(0,0,0,0.10)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.14)] text-sm flex-shrink-0"
        >
          Cancel
        </motion.button>
      </motion.div>

      {/* End time display — intentional breathing room below the ring */}
      <div className="mt-5 h-7 flex items-center justify-center">
        {endTime && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-500 text-sm"
          >
            Timer ends at: {formatEndTime(endTime)}
          </motion.p>
        )}
      </div>

      {/* Preset buttons — hidden during focus mode */}
      <AnimatePresence>
        {!isFocusMode && mode === "focus" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center gap-4 mt-2"
          >
            <div className="flex flex-wrap justify-center gap-2">
              {presets.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePresetClick(preset.value)}
                  className="px-3 py-2 bg-[#D4C4B0] text-gray-800 font-medium rounded-lg hover:bg-[#C4B4A0] transition-all duration-200 shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] text-sm"
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCustomPicker(true)}
              className="px-4 py-2 bg-[#E8E2D6] text-gray-700 font-medium rounded-lg hover:bg-[#D8D2C6] transition-all duration-200 shadow-[0_4px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.12)] text-sm"
            >
              Custom Time
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomTimePicker
        isOpen={showCustomPicker}
        onClose={() => setShowCustomPicker(false)}
        onSelect={handleCustomTimeSelect}
      />
    </motion.div>
  )
}

export default TimerCircle