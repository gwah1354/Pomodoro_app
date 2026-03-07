import { motion } from "framer-motion"
import TimerCircle from "./components/TimerCircle"

function App() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#F5F1E8] gap-8">

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="text-3xl font-semibold text-gray-800"
      >
        Good evening. Let's get some work done!
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      >
        <TimerCircle />
      </motion.div>

    </div>
  )
}

export default App