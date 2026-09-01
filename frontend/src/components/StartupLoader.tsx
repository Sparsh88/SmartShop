import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StartupLoaderProps {
  onComplete?: () => void;
}

export default function StartupLoader({ onComplete }: StartupLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [statusMessage, setStatusMessage] = useState('INITIALIZING FLAGSHIP');

  // Track system theme preference dynamically
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      // If user hasn't explicitly set a theme in localStorage, adapt to system change
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  // Smooth animation progress from 0 to 100 over ~2.3 seconds
  useEffect(() => {
    const startTime = performance.now();
    const duration = 2200; // 2.2 seconds total animation duration

    let animationFrameId: number;

    const animateProgress = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progressRatio = Math.min(elapsed / duration, 1);

      // Smooth custom bezier-like easing curve (easeOutCubic with dynamic pacing)
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3);
      const currentVal = Math.floor(easedProgress * 100);

      setProgress(currentVal);

      // Update dynamic status text based on progress milestone
      if (currentVal < 28) {
        setStatusMessage('INITIALIZING FLAGSHIP');
      } else if (currentVal < 60) {
        setStatusMessage('CURATING CAPSULE DROPS');
      } else if (currentVal < 88) {
        setStatusMessage('SYNCING DIGITAL CATALOG');
      } else {
        setStatusMessage('READY • ENTERING SMARTSHOP');
      }

      if (progressRatio < 1) {
        animationFrameId = requestAnimationFrame(animateProgress);
      } else {
        setProgress(100);
        // Small pause at 100% for visual satisfaction before smooth exit
        setTimeout(() => {
          setIsFinished(true);
        }, 180);
      }
    };

    animationFrameId = requestAnimationFrame(animateProgress);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <AnimatePresence
      onExitComplete={() => {
        if (onComplete) onComplete();
      }}
    >
      {!isFinished && (
        <motion.div
          key="smartshop-startup-loader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.015,
            filter: 'blur(6px)',
            transition: {
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          className={`fixed inset-0 z-[9999] flex flex-col justify-between p-6 sm:p-10 md:p-14 select-none overflow-hidden ${
            isDark ? 'bg-[#0D0D0E] text-white' : 'bg-[#FAF9F6] text-[#121212]'
          }`}
          style={{ willChange: 'opacity, transform' }}
        >
          {/* Subtle Ambient Background Gradient Glow */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-700"
            style={{
              background: isDark
                ? 'radial-gradient(ellipse at 50% 45%, rgba(255, 255, 255, 0.035) 0%, transparent 70%)'
                : 'radial-gradient(ellipse at 50% 45%, rgba(0, 0, 0, 0.02) 0%, transparent 70%)',
            }}
          />

          {/* 1. TOP BAR: Modern Editorial Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full flex items-center justify-between text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase text-neutral-400 dark:text-neutral-500 z-10"
          >
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>EST. 2026</span>
            </div>
            <div className="hidden xs:block tracking-[0.2em] font-medium">
              CURATED CONTEMPORARY FASHION
            </div>
            <div className="flex items-center gap-1.5">
              <span>DIGITAL FLAGSHIP</span>
              <span className="text-neutral-300 dark:text-neutral-600">•</span>
              <span className="text-neutral-900 dark:text-white font-black">2.0</span>
            </div>
          </motion.div>

          {/* 2. CENTER: SMART SHOP Iconic Brand Reveal */}
          <div className="flex-1 flex flex-col items-center justify-center text-center z-10 my-auto py-8">
            {/* Animated Brand Emblem Monogram */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="mb-4 sm:mb-6"
            >
              <div
                className={`w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-editorial font-extrabold text-xl sm:text-2xl tracking-tighter border shadow-soft-sm ${
                  isDark
                    ? 'bg-neutral-900/80 border-neutral-800 text-white shadow-[0_0_25px_rgba(255,255,255,0.06)]'
                    : 'bg-white/90 border-neutral-200/90 text-neutral-900 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
                }`}
              >
                S
              </div>
            </motion.div>

            {/* Large Elegant Typography: "SMART" & "SHOP" */}
            <div className="overflow-hidden space-y-0 sm:space-y-1">
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                <h1 className="font-editorial text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[112px] font-black tracking-[-0.04em] leading-[0.88] uppercase select-none">
                  SMART
                </h1>
              </motion.div>

              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              >
                <h1 className="font-editorial text-6xl xs:text-7xl sm:text-8xl md:text-9xl lg:text-[112px] font-black tracking-[-0.04em] leading-[0.88] uppercase select-none text-neutral-400 dark:text-neutral-500">
                  SHOP
                </h1>
              </motion.div>
            </div>

            {/* Sub-tagline */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              className="mt-4 sm:mt-6 text-[10px] sm:text-xs font-bold tracking-[0.3em] uppercase text-neutral-500 dark:text-neutral-400 max-w-xs sm:max-w-md mx-auto"
            >
              CRAFTED FOR MODERN AESTHETICS
            </motion.p>
          </div>

          {/* 3. BOTTOM: Smooth Progress Bar & Percentage Counter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="w-full flex flex-col items-center justify-center space-y-3 sm:space-y-4 z-10"
          >
            {/* Progress Text Indicator */}
            <div className="flex items-center justify-between w-64 sm:w-80 md:w-96 text-[10px] sm:text-[11px] font-extrabold tracking-[0.2em] uppercase">
              <span className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <span>ENTERING SMARTSHOP</span>
                <span className="text-neutral-300 dark:text-neutral-700">•</span>
                <span className="text-neutral-900 dark:text-white tabular-nums">
                  {progress}%
                </span>
              </span>
              <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-neutral-500 hidden sm:inline-block">
                {statusMessage}
              </span>
            </div>

            {/* Sleek Progress Bar Track */}
            <div
              className={`w-64 sm:w-80 md:w-96 h-[3px] sm:h-[3.5px] rounded-full overflow-hidden relative ${
                isDark ? 'bg-neutral-800/90' : 'bg-neutral-200'
              }`}
            >
              {/* Dynamic Progress Fill */}
              <motion.div
                className={`h-full rounded-full transition-all duration-75 ease-out relative ${
                  isDark
                    ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]'
                    : 'bg-[#121212] shadow-[0_0_10px_rgba(0,0,0,0.2)]'
                }`}
                style={{ width: `${progress}%` }}
              >
                {/* Subtle Leading Edge Pulse/Glow */}
                <div
                  className={`absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full ${
                    isDark ? 'bg-white shadow-[0_0_10px_#fff]' : 'bg-neutral-900'
                  }`}
                />
              </motion.div>
            </div>

            {/* Mobile Status Sub-Text */}
            <div className="text-[9px] font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase sm:hidden pt-0.5">
              {statusMessage}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
