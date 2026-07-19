import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Expanded pool of famous movie posters
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
  "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg", // Parasite
  "https://image.tmdb.org/t/p/w500/bptfVGEQuv6vDTIMVCHjJ9Dz8PX.jpg", // Jurassic Park
  "https://image.tmdb.org/t/p/w500/6oom5QYQ2yQTMJIhq9LN1V1514h.jpg", // Lord of the Rings
  "https://image.tmdb.org/t/p/w500/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg", // The Terminator
  "https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNclRUBiGQGOv.jpg", // Spirited Away
  "https://image.tmdb.org/t/p/w500/yJdeWaVXa2se9agI6B4mQunVYpO.jpg", // Back to the Future
  "https://image.tmdb.org/t/p/w500/2l05cFWJiqzD392LzO5B6iY11Zc.jpg", // Spider-Man Into the Spider-Verse
  "https://image.tmdb.org/t/p/w500/811DjJTon9gD6hZ8nCjMfbPNAi9.jpg", // Oppenheimer
  "https://image.tmdb.org/t/p/w500/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg"  // Game of Thrones (or equivalent iconic poster)
];

const SinglePoster = ({ windowSize, initialDelay }: { windowSize: { width: number, height: number }, initialDelay: boolean }) => {
  const [key, setKey] = useState(0);

  // Re-roll everything when key changes (which happens when animation completes)
  const poster = POSTERS[Math.floor(Math.random() * POSTERS.length)];
  const startX = Math.random() * windowSize.width;
  // Start slightly below the screen so it enters immediately
  const startY = windowSize.height + 250; 
  // End way above the screen to ensure it floats completely off
  const endY = -800;
  
  const xDrift = (Math.random() - 0.5) * 300;
  
  // Slower, elegant floating speed (30s to 60s)
  const duration = 30 + Math.random() * 30; 
  
  // Distribute the initial posters across the entire vertical space by using negative delays 
  // spanning the maximum duration.
  const delay = (initialDelay && key === 0) ? -(Math.random() * 60) : 0;
  
  const scale = 0.5 + Math.random() * 0.7;
  const rotateStart = (Math.random() - 0.5) * 20;
  const rotateEnd = rotateStart + (Math.random() - 0.5) * 40;
  
  // Mix up blurs from sharp (0px) to very blurry (5px)
  const blurAmount = Math.random() * 5;

  return (
    <motion.div
      key={key}
      className="absolute rounded-xl overflow-hidden shadow-2xl border border-white/10"
      style={{
        width: 250,
        height: 375, // Standard poster ratio
        filter: `blur(${blurAmount}px)`,
        // We ensure opacity stays between 0.3 (blurry) and 0.8 (sharp)
        opacity: 0.8 - (blurAmount * 0.1), 
      }}
      initial={{ x: startX, y: startY, rotate: rotateStart, scale: scale }}
      animate={{ x: startX + xDrift, y: endY, rotate: rotateEnd }}
      transition={{ duration, ease: "linear", delay }}
      onAnimationComplete={() => setKey(prev => prev + 1)} // Reset and re-roll!
    >
      <img 
        src={poster} 
        alt="Movie Poster" 
        className="w-full h-full object-cover mix-blend-luminosity brightness-75"
        loading="lazy"
      />
    </motion.div>
  );
};

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

  // Render 40 active floating posters to keep the background partially filled
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none mix-blend-screen opacity-80 z-0" style={{ pointerEvents: 'none' }}>
      {[...Array(40)].map((_, i) => (
        <SinglePoster key={`slot-${i}`} windowSize={windowSize} initialDelay={true} />
      ))}
    </div>
  );
};
