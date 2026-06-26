'use client';

import { motion } from 'framer-motion';

/**
 * LoadingSpinner component displaying a complex animated loader.
 *
 * Uses multiple concentric circles with different animations (scaling, rotating, pulsing)
 * created with Framer Motion.
 */
export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-16 h-16">
        <motion.div
          className="absolute inset-0 border-4 border-blue-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
            borderRadius: ["50%", "30%", "50%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-purple-500 rounded-full"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-pink-500 rounded-full"
          animate={{
            scale: [1, 0.8, 1],
            opacity: [1, 0.8, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
}
