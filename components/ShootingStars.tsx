
import React, { useEffect, useState, useRef } from 'react';

interface Star {
  id: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
}

interface Props {
  frequencyMultiplier?: number;
}

const ShootingStars: React.FC<Props> = ({ frequencyMultiplier = 1 }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const addStar = () => {
    const id = Date.now();
    const left = Math.floor(Math.random() * 100) + 20; 
    const top = Math.floor(Math.random() * 70) - 50;
    
    const newStar: Star = {
      id,
      top,
      left,
      duration: (2 + Math.random() * 1.5) / frequencyMultiplier,
      delay: Math.random() * 0.5,
    };

    setStars((prev) => [...prev, newStar]);
    setTimeout(() => {
      setStars((prev) => prev.filter((s) => s.id !== id));
    }, (newStar.duration + newStar.delay + 1) * 1000);
  };

  useEffect(() => {
    const scheduleNextStar = () => {
        const nextDelay = (2000 + Math.random() * 4000) / frequencyMultiplier;
        timeoutRef.current = window.setTimeout(() => {
            addStar();
            scheduleNextStar();
        }, nextDelay);
    };

    scheduleNextStar();
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [frequencyMultiplier]);

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
