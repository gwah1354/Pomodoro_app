import { useState, useEffect } from "react"

function TimerCircle() {

  const totalTime = 25 * 60
  const [timeLeft, setTimeLeft] = useState(totalTime)
  const [isRunning, setIsRunning] = useState(false)

  const radius = 120
  const stroke = 10
  const normalizedRadius = radius - stroke / 2
  const circumference = 2 * Math.PI * normalizedRadius

  const progress = timeLeft / totalTime
  const strokeDashoffset = circumference * (1 - progress)

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(interval)
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

        <circle
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

      <button
        onClick={() => setIsRunning(!isRunning)}
        className="px-6 py-2 bg-[#C8B6A6] rounded-lg text-gray-800 font-medium hover:scale-105 transition"
      >
        {isRunning ? "Pause" : "Start"}
      </button>

    </div>
  )
}

export default TimerCircle