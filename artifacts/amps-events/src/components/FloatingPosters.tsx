import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const POSTERS = [
  "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", // Interstellar
  "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg", // The Dark Knight
  "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", // Inception
  "https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", // Matrix
  "https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg", // Dune
  "https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", // Pulp Fiction
  "https://image.tmdb.org/t/p/w500/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg", // Avatar
  "https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", // Fight Club
  "https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg", // Avengers: Infinity War
  "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg", // Forrest Gump
  "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", // The Godfather
  "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"  // Parasite
];

export const FloatingPosters: React.FC = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Only access window on client
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (windowSize.width === 0) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-30">
      {POSTERS.map((poster, i) => {
        // Randomize starting properties for each poster
        const startX = Math.random() * windowSize.width;
        const startY = windowSize.height + Math.random() * 500;
        
        // Randomize the destination Y
        const endY = -1000 - Math.random() * 500;
        
        // Randomize horizontal drift
        const xDrift = (Math.random() - 0.5) * 400;
        
        // Randomize speeds and delays
        const duration = 25 + Math.random() * 20; // 25s to 45s
        const delay = Math.random() * -30; // Negative delay to start mid-animation
        
        // Randomize scale and rotation
        const scale = 0.5 + Math.random() * 0.8;
        const rotateStart = (Math.random() - 0.5) * 30;
        const rotateEnd = rotateStart + (Math.random() - 0.5) * 60;
        
        // Randomize blurring to create depth
        const blurAmount = 1 + Math.random() * 4;

        return (
          <motion.div
            key={i}
            className="absolute rounded-xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              width: 250,
              height: 375, // Standard poster ratio
              filter: `blur(${blurAmount}px)`,
              opacity: 0.7 - (blurAmount * 0.1), // More blur = less opacity
            }}
            initial={{
              x: startX,
              y: startY,
              rotate: rotateStart,
              scale: scale,
            }}
            animate={{
              x: startX + xDrift,
              y: endY,
              rotate: rotateEnd,
            }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "linear",
              delay: delay,
            }}
          >
            <img 
              src={poster} 
              alt="Movie Poster" 
              className="w-full h-full object-cover mix-blend-luminosity brightness-75"
              loading="lazy"
            />
          </motion.div>
        );
      })}
    </div>
  );
};
