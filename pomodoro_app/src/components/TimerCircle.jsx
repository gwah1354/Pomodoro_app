import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import CustomTimePicker from "./CustomTimePicker"

function TimerCircle({ onFocusModeChange }) {

  const [totalTime, setTotalTime] = useState(25 * 60)
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [isRunning, setIsRunning] = useState(false)
  const [endTime, setEndTime] = useState(null)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const [timeKey, setTimeKey] = useState(0)
  const [isFocusMode, setIsFocusMode] = useState(false)

  const radius = 120
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius

  const progress = timeLeft / totalTime
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const presets = [
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "45 min", value: 45 }
  ]

  const formatEndTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const handlePresetClick = (minutes) => {
    const newTotalTime = minutes * 60
    setTotalTime(newTotalTime)
    setTimeLeft(newTotalTime)
    setIsRunning(false)
    setEndTime(null)
    setTimeKey(prev => prev + 1)
  }

  const handleCustomTimeSelect = (minutes) => {
    handlePresetClick(minutes)
  }

  const handleCancel = () => {
    setIsRunning(false)
    setTimeLeft(totalTime)
    setEndTime(null)
    setTimeKey(prev => prev + 1)
    setIsFocusMode(false)
    onFocusModeChange(false)
  }

  const handleStartPause = () => {
    if (!isRunning && timeLeft > 0) {
      const end = new Date(Date.now() + timeLeft * 1000)
      setEndTime(end)
      setIsFocusMode(true)
      onFocusModeChange(true)
    } else {
      setEndTime(null)
    }
    setIsRunning(!isRunning)
  }

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setIsRunning(false)
          setEndTime(null)
          setIsFocusMode(false)
          onFocusModeChange(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)

  }, [isRunning])

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex items-center justify-center gap-12">
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartPause}
          className="w-20 h-20 rounded-full bg-[#D6C2AF] flex items-center justify-center text-gray-800 font-medium hover:bg-[#cbb39c] transition-colors text-sm"
        >
          {!isRunning && timeLeft === totalTime ? "Start" : 
           isRunning ? "Pause" : "Resume"}
        </motion.button>

        <svg height={radius * 2} width={radius * 2}>

          <defs>
            <filter id="ringShadow">
              <feDropShadow 
                dx="0"
                dy="1"
                stdDeviation="1.5"
                floodColor="#000000"
                floodOpacity="0.15"
              />
            </filter>
          </defs>

          <circle
            stroke="#E8E2D6"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <motion.circle
            stroke="#5B4636"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            filter="url(#ringShadow)"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              transition: "stroke-dashoffset 1s ease-in-out"
            }}
          />

          <AnimatePresence mode="wait">
            <motion.text
              key={timeKey}
              x="50%"
              y="48%"
              dominantBaseline="middle"
              textAnchor="middle"
              className="text-4xl fill-gray-800 font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </motion.text>
          </AnimatePresence>

        </svg>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCancel}
          className="w-20 h-20 rounded-full bg-[#D6C2AF] flex items-center justify-center text-gray-800 font-medium hover:bg-[#cbb39c] transition-colors text-sm"
        >
          Cancel
        </motion.button>

      </div>

      <div className="h-6 flex items-center justify-center">
        {endTime && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gray-600 text-sm"
          >
            Timer ends at: {formatEndTime(endTime)}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="flex flex-col items-center gap-4 mt-10"
          >
            <div className="flex gap-2">
              {presets.map((preset) => (
                <motion.button
                  key={preset.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePresetClick(preset.value)}
                  className="px-3 py-2 bg-[#D4C4B0] text-gray-800 font-medium rounded-lg hover:bg-[#C4B4A0] transition-colors text-sm"
                >
                  {preset.label}
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCustomPicker(true)}
              className="px-4 py-2 bg-[#E8E2D6] text-gray-700 font-medium rounded-lg hover:bg-[#D8D2C6] transition-colors text-sm"
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

    </div>
  )

}

export default TimerCircle