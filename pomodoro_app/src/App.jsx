import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import TimerCircle from "./components/TimerCircle"

function App() {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning. Let's get some work done!"
    if (hour < 17) return "Good afternoon. Let's get some work done!"
    return "Good evening. Let's get some work done!"
  }

  const [isFocusMode, setIsFocusMode] = useState(false)

  const handleFocusModeChange = (focusMode) => {
    setIsFocusMode(focusMode)
  }

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F5F1E8] relative overflow-hidden">
      
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
          ) : (
            <motion.h1
              key="focus"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="text-3xl font-semibold text-gray-800 mb-16"
            >
              Focus
            </motion.h1>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <TimerCircle onFocusModeChange={handleFocusModeChange} />
        </motion.div>

      </div>

    </div>
  )
}

export default App