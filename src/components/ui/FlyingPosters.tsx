"use client";

import { motion } from "motion/react";

interface PosterConfig {
  x: string;
  y: string;
  rotate: number;
  width: number;
  opacity: number;
  floatX: number;
  floatY: number;
  duration: number;
  delay: number;
  rotateAmt: number;
}

// 18 slots spread across all four quadrants of the viewport — centre kept clear for content
const CONFIGS: PosterConfig[] = [
  // top-left zone
  { x: "-6%",  y: "3%",  rotate: -14, width: 160, opacity: 0.50, floatX: 16, floatY: 26, duration: 10, delay: 0,   rotateAmt: 4 },
  { x: "10%",  y: "18%", rotate: 7,   width: 130, opacity: 0.38, floatX: 12, floatY: 20, duration: 13, delay: 2.0, rotateAmt: 3 },
  { x: "4%",   y: "55%", rotate: -9,  width: 145, opacity: 0.42, floatX: 18, floatY: 22, duration: 11, delay: 1.0, rotateAmt: 5 },
  { x: "12%",  y: "78%", rotate: 12,  width: 115, opacity: 0.34, floatX: 10, floatY: 18, duration: 14, delay: 3.5, rotateAmt: 3 },

  // top-right zone
  { x: "72%",  y: "2%",  rotate: 10,  width: 155, opacity: 0.48, floatX: 20, floatY: 28, duration: 9,  delay: 0.5, rotateAmt: 4 },
  { x: "86%",  y: "14%", rotate: -6,  width: 120, opacity: 0.36, floatX: 14, floatY: 16, duration: 12, delay: 2.8, rotateAmt: 3 },
  { x: "90%",  y: "48%", rotate: 18,  width: 140, opacity: 0.44, floatX: 12, floatY: 24, duration: 10, delay: 1.5, rotateAmt: 5 },
  { x: "78%",  y: "70%", rotate: -12, width: 130, opacity: 0.40, floatX: 16, floatY: 20, duration: 13, delay: 4.0, rotateAmt: 4 },
  { x: "88%",  y: "84%", rotate: 8,   width: 115, opacity: 0.33, floatX: 10, floatY: 16, duration: 15, delay: 5.5, rotateAmt: 3 },

  // middle-left fringe
  { x: "-2%",  y: "36%", rotate: 16,  width: 125, opacity: 0.36, floatX: 14, floatY: 20, duration: 12, delay: 1.8, rotateAmt: 4 },
  { x: "20%",  y: "44%", rotate: -7,  width: 105, opacity: 0.28, floatX: 8,  floatY: 14, duration: 16, delay: 6.0, rotateAmt: 2 },

  // middle-right fringe
  { x: "65%",  y: "36%", rotate: -4,  width: 118, opacity: 0.32, floatX: 12, floatY: 18, duration: 14, delay: 3.0, rotateAmt: 3 },
  { x: "58%",  y: "55%", rotate: 14,  width: 108, opacity: 0.28, floatX: 8,  floatY: 12, duration: 17, delay: 7.0, rotateAmt: 2 },

  // bottom zone
  { x: "28%",  y: "82%", rotate: -10, width: 135, opacity: 0.38, floatX: 14, floatY: 22, duration: 11, delay: 2.5, rotateAmt: 4 },
  { x: "46%",  y: "88%", rotate: 6,   width: 120, opacity: 0.34, floatX: 10, floatY: 18, duration: 13, delay: 4.5, rotateAmt: 3 },
  { x: "60%",  y: "78%", rotate: -15, width: 128, opacity: 0.36, floatX: 16, floatY: 20, duration: 12, delay: 1.2, rotateAmt: 5 },

  // top centre fringe (pushed toward edges)
  { x: "35%",  y: "-2%", rotate: 4,   width: 110, opacity: 0.30, floatX: 20, floatY: 14, duration: 14, delay: 3.8, rotateAmt: 3 },
  { x: "50%",  y: "2%",  rotate: -8,  width: 100, opacity: 0.26, floatX: 16, floatY: 10, duration: 16, delay: 5.0, rotateAmt: 2 },
];

interface FlyingPostersProps {
  images: string[];
}

export function FlyingPosters({ images }: FlyingPostersProps) {
  return (
    // fixed so the layer covers the viewport the entire time the user scrolls
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {CONFIGS.map((cfg, i) => {
        const src = images[i % images.length];
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: cfg.x,
              top: cfg.y,
              rotate: cfg.rotate,
              opacity: 0,
            }}
            animate={{
              opacity: cfg.opacity,
              y: [0, -cfg.floatY, cfg.floatY * 0.6, -cfg.floatY * 0.3, 0],
              x: [0, cfg.floatX * 0.5, -cfg.floatX * 0.4, cfg.floatX * 0.2, 0],
              rotate: [
                cfg.rotate,
                cfg.rotate + cfg.rotateAmt,
                cfg.rotate - cfg.rotateAmt * 0.7,
                cfg.rotate + cfg.rotateAmt * 0.4,
                cfg.rotate,
              ],
            }}
            transition={{
              opacity: { duration: 1.4, delay: cfg.delay, ease: "easeOut" },
              y: { duration: cfg.duration, repeat: Infinity, ease: "easeInOut", delay: cfg.delay },
              x: { duration: cfg.duration * 1.35, repeat: Infinity, ease: "easeInOut", delay: cfg.delay },
              rotate: { duration: cfg.duration * 1.7, repeat: Infinity, ease: "easeInOut", delay: cfg.delay },
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              draggable={false}
              style={{
                width: `${cfg.width}px`,
                aspectRatio: "3/4",
                objectFit: "cover",
                borderRadius: "10px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.65), 0 4px 16px rgba(0,0,0,0.45)",
                userSelect: "none",
                display: "block",
              }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
