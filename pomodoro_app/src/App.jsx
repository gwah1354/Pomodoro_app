import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TimerCircle from "./components/TimerCircle"
import SoundSelector from "./components/SoundSelector"

function App() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning. Let's get some work done!"
    if (hour < 17) return "Good afternoon. Let's get some work done!"
    return "Good evening. Let's get some work done!"
  }

  // Single source of truth for focus mode, current mode, and completion message
  const [isFocusMode, setIsFocusMode] = useState(false)
  const [completionMessage, setCompletionMessage] = useState("")
  const [currentMode, setCurrentMode] = useState("focus")

  const handleFocusModeChange = (focusMode) => {
    setIsFocusMode(focusMode)
  }

  const handleCompletion = (message) => {
    setCompletionMessage(message)
  }

  const handleReset = () => {
    setCompletionMessage("")
  }

  const handleModeChange = (mode) => {
    setCurrentMode(mode)
  }

  // Heading text that reflects the current mode during focus
  const getFocusHeading = () => {
    if (currentMode === "short-break") return "Enjoy your break"
    if (currentMode === "long-break") return "Relax and reset"
    return "Focus"
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(circle at center, #F7F3EA 0%, #F1EBDD 45%, #E8E2D6 75%, #DED7CA 100%)",
      }}
    >
      {/* Focus mode overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-black bg-opacity-15 z-10"
          />
        )}
      </AnimatePresence>

      {/* Main content — always centered, layout does NOT shift */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full px-4">

        {/* Heading — fades between greeting / completion / focus mode text */}
        <AnimatePresence mode="wait">
          {!isFocusMode ? (
            completionMessage ? (
              <motion.h1
                key="completion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 text-center"
              >
                {completionMessage}
              </motion.h1>
            ) : (
              <motion.h1
                key="greeting"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8 text-center"
              >
                {getGreeting()}
              </motion.h1>
            )
          ) : (
            <motion.h1
              key={`focus-${currentMode}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-8"
            >
              {getFocusHeading()}
            </motion.h1>
          )}
        </AnimatePresence>

        {/* Timer — always mounted so it stays centered */}
        <TimerCircle
          isFocusMode={isFocusMode}
          onFocusModeChange={handleFocusModeChange}
          onCompletion={handleCompletion}
          onReset={handleReset}
          onModeChange={handleModeChange}
        />
      </div>

      {/* Sound selector */}
      <SoundSelector isFocusMode={isFocusMode} />
    </div>
  )
}

export default App