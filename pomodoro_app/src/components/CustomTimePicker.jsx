import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function CustomTimePicker({ isOpen, onClose, onSelect }) {
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const scrollRef = useRef(null)
  const snapTimerRef = useRef(null)

  const minutes = Array.from({ length: 60 }, (_, i) => i + 1)
  const ITEM_HEIGHT = 40

  // Scroll to selected item when modal opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const index = selectedMinutes - 1
      scrollRef.current.scrollTop = index * ITEM_HEIGHT
    }
  }, [isOpen, selectedMinutes])

  // Debounced snap — fires 150ms after the user stops scrolling
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return
    if (snapTimerRef.current) clearTimeout(snapTimerRef.current)

    snapTimerRef.current = setTimeout(() => {
      if (!scrollRef.current) return
      const index = Math.round(scrollRef.current.scrollTop / ITEM_HEIGHT)
      const clamped = Math.max(0, Math.min(index, minutes.length - 1))
      const snapped = minutes[clamped]
      setSelectedMinutes(snapped)
      scrollRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' })
    }, 150)
  }, [minutes])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (snapTimerRef.current) clearTimeout(snapTimerRef.current) }
  }, [])

  const handleItemClick = (min) => {
    setSelectedMinutes(min)
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: (min - 1) * ITEM_HEIGHT, behavior: 'smooth' })
    }
  }

  const handleConfirm = () => {
    onSelect(selectedMinutes)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-[#F5F1E8] rounded-2xl p-6 w-full max-w-xs shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Select Duration
          </h3>

          <div className="relative h-64 mb-6">
            {/* Selection highlight */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="h-12 w-full bg-[#E8E2D6] rounded-lg opacity-50" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="h-12 w-full border-2 border-[#C8B6A6] rounded-lg" />
            </div>

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto py-28"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'y mandatory',
              }}
            >
              {minutes.map((minute) => (
                <div
                  key={minute}
                  onClick={() => handleItemClick(minute)}
                  className={`h-10 flex items-center justify-center cursor-pointer transition-all ${minute === selectedMinutes
                      ? 'text-gray-800 font-semibold text-lg'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  style={{ scrollSnapAlign: 'center' }}
                >
                  {minute} min
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 bg-[#E8E2D6] text-gray-700 rounded-lg font-medium hover:bg-[#D8D2C6] transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="flex-1 py-3 bg-[#C8B6A6] text-gray-800 rounded-lg font-medium hover:bg-[#B8A696] transition-colors"
            >
              Set Timer
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default CustomTimePicker
