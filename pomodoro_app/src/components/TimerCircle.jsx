import { useState, useEffect } from "react"
import { motion } from "framer-motion"

function TimerCircle() {

  const [totalTime, setTotalTime] = useState(25 * 60)
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [isRunning, setIsRunning] = useState(false)
  const [endTime, setEndTime] = useState(null)

  const radius = 120
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius

  const progress = timeLeft / totalTime
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const presets = [25, 30, 40, 45]

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
  }

  const handleStartPause = () => {
    if (!isRunning && timeLeft > 0) {
      const end = new Date(Date.now() + timeLeft * 1000)
      setEndTime(end)
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
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)

  }, [isRunning])

  return (
    <div className="flex flex-col items-center gap-6">

      <svg height={radius * 2} width={radius * 2}>

        <circle
          stroke="#E8E2D6"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        <motion.circle
          stroke="#3A3A3A"
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="text-3xl fill-gray-800 font-bold"
        >
          {String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </text>

      </svg>

      {endTime && (
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-600 text-sm"
        >
          Timer ends at: {formatEndTime(endTime)}
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleStartPause}
        className="px-6 py-2 bg-[#C8B6A6] rounded-lg text-gray-800 font-medium hover:bg-[#B8A696] transition-colors"
      >
        {isRunning ? "Pause" : "Start"}
      </motion.button>

      <div className="flex gap-2">
        {presets.map((preset) => (
          <motion.button
            key={preset}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePresetClick(preset)}
            className="w-12 h-12 rounded-full bg-[#D4C4B0] text-gray-800 font-medium hover:bg-[#C4B4A0] transition-colors"
          >
            {preset}
          </motion.button>
        ))}
      </div>

    </div>
  )
}

export default TimerCircle