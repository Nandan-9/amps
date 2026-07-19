'use client';
import { useRef, useEffect, ReactNode, CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}

export function Magnetic({ children, strength = 0.35, className = '', style }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 200, damping: 20, mass: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mouseX.set((e.clientX - cx) * strength);
      mouseY.set((e.clientY - cy) * strength);
    };

    const handleLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [mouseX, mouseY, strength]);

  return (
    <motion.div ref={ref} style={{ x: springX, y: springY, ...style }} className={className}>
      {children}
    </motion.div>
  );
}
