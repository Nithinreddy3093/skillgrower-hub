
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface IntroAnimationProps {
  children: React.ReactNode;
  duration?: number;
  onComplete?: () => void;
}

export const IntroAnimation = ({ 
  children,
  duration = 3200, // Slightly longer duration for a more impactful animation
  onComplete 
}: IntroAnimationProps) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              scale: 1.05, // Slight scale effect on exit for a more dynamic transition
              y: -10 
            }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-800 dark:to-indigo-950"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                y: [0, -15, 0] // Subtle bounce effect
              }}
              transition={{ 
                duration: 1.2,
                y: {
                  duration: 1.5,
                  repeat: 0,
                  ease: "easeInOut"
                }
              }}
              className="text-center px-6"
            >
              <motion.div
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.3, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="w-28 h-28 bg-white dark:bg-indigo-800 rounded-2xl p-5 mx-auto mb-6 shadow-xl"
              >
                <svg viewBox="0 0 24 24" fill="none" className="text-indigo-600 dark:text-indigo-200 w-full h-full">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.div>
              <motion.h1
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.6, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-5xl font-bold text-white mb-3"
              >
                SkillTrack
              </motion.h1>
              <motion.p
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ 
                  delay: 0.9, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
                className="text-xl text-indigo-100"
              >
                Track your skills, achieve your goals
              </motion.p>
              
              {/* Added loading indicator for polish */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="mt-8 flex justify-center"
              >
                <div className="flex space-x-2">
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0
                    }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.2
                    }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ 
                      repeat: Infinity,
                      duration: 1.5,
                      delay: 0.4
                    }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: show ? 0 : 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </>
  );
};
