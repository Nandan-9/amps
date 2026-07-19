'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Spring for smooth lagging outer ring
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const ringX = useSpring(cursorX, springConfig);
  const ringY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const checkPointer = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = !!(
        target.closest('a, button, [role="button"], input, select, textarea, label, [tabindex]') ||
        window.getComputedStyle(target).cursor === 'pointer'
      );
      setIsPointer(isClickable);
    };

    const handleLeave = () => setIsHidden(true);
    const handleEnter = () => setIsHidden(false);
    const handleDown = () => setIsClicking(true);
    const handleUp = () => setIsClicking(false);

    window.addEventListener('mousemove', move);
    window.addEventListener('mousemove', checkPointer);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mousemove', checkPointer);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Dot — follows exactly */}
      <motion.div
        className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
        style={{ x: cursorX, y: cursorY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: isHidden ? 0 : 1,
          scale: isClicking ? 0.5 : isPointer ? 0 : 1,
        }}
        transition={{ duration: 0.1 }}
      >
        <div className="w-2 h-2 bg-white rounded-full" />
      </motion.div>

      {/* Ring — lags behind with spring */}
      <motion.div
        className="fixed top-0 left-0 z-[9998] pointer-events-none"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: isHidden ? 0 : 1,
          scale: isClicking ? 0.7 : isPointer ? 1.8 : 1,
        }}
        transition={{ duration: 0.15 }}
      >
        <div
          className={`rounded-full border transition-all duration-200 ${
            isPointer
              ? 'w-10 h-10 border-purple-400/70 bg-purple-500/10'
              : 'w-7 h-7 border-white/30'
          }`}
        />
      </motion.div>

      {/* Glow trail — very soft, large radius */}
      <motion.div
        className="fixed top-0 left-0 z-[9997] pointer-events-none"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: isHidden ? 0 : 0.15 }}
      >
        <div
          className="w-40 h-40 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      </motion.div>
    </>
  );
}
