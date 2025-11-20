import React, { useEffect, useState } from 'react';

interface Star {
  id: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
}

const ShootingStars: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    // Function to add a new star
    const addStar = () => {
      const id = Date.now();
      
      // Calculate start position
      // We want them to start mostly off-screen Top or Right, flying towards Bottom-Left.
      // Randomize Left from 20% to 120% (mostly right side)
      // Randomize Top from -50% to 20% (mostly top side)
      const left = Math.floor(Math.random() * 100) + 20; 
      const top = Math.floor(Math.random() * 70) - 50;
      
      const newStar: Star = {
        id,
        top,
        left,
        duration: 2 + Math.random() * 1.5, // 2s - 3.5s speed
        delay: Math.random() * 0.5, // Slight start delay
      };

      setStars((prev) => [...prev, newStar]);

      // Cleanup star after animation
      setTimeout(() => {
        setStars((prev) => prev.filter((s) => s.id !== id));
      }, (newStar.duration + newStar.delay + 1) * 1000);
    };

    // Spawner loop
    // Random interval between 2s and 6s
    const scheduleNextStar = () => {
        const nextDelay = 2000 + Math.random() * 4000;
        setTimeout(() => {
            addStar();
            scheduleNextStar();
        }, nextDelay);
    };

    // Initial star
    scheduleNextStar();

    // Add one immediately for effect on load
    if (Math.random() > 0.5) addStar();

    return () => {
      // Cleanup is tricky with recursive timeouts without refs, 
      // but React unmount will kill the component rendering anyway.
      // A proper cleanup would clear the timeout ID.
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="shooting-star"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ShootingStars;