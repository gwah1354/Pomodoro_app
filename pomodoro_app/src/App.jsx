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

  const [isFocusMode, setIsFocusMode] = useState(false)
  const [completionMessage, setCompletionMessage] = useState("")

  const handleFocusModeChange = (focusMode) => {
    setIsFocusMode(focusMode)
  }

  const handleCompletion = (message) => {
    setCompletionMessage(message)
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: "radial-gradient(circle at center, #F7F3EA 0%, #F1EBDD 45%, #E8E2D6 75%, #DED7CA 100%)"
      }}
    >
      
      <AnimatePresence>
        {isFocusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-black bg-opacity-20 z-10"
          />
        )}
      </AnimatePresence>

      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full">
        
        <AnimatePresence mode="wait">
          {!isFocusMode ? (
            completionMessage ? (
              <motion.h1
                key="completion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="text-3xl font-semibold text-gray-800 mb-8"
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
                className="text-3xl font-semibold text-gray-800 mb-8"
              >
                {getGreeting()}
              </motion.h1>
            )
          ) : (
            <motion.h1
              key="focus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-3xl font-semibold text-gray-800 mb-8"
            >
              Focus
            </motion.h1>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <TimerCircle onFocusModeChange={handleFocusModeChange} onCompletion={handleCompletion} />
          
          <SoundSelector isFocusMode={isFocusMode} />
        </motion.div>

      </div>

    </div>
  )
}

export default App