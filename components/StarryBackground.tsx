import React, { useEffect, useRef } from 'react';

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let stars: Array<{
      x: number;
      y: number;
      radius: number;
      baseAlpha: number;
      phase: number;
      speed: number;
    }> = [];

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      
      // Set display size (css pixels)
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      
      // Set actual size in memory (scaled to account for extra pixel density)
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      initStars(canvas.width, canvas.height, dpr);
    };

    const initStars = (width: number, height: number, dpr: number) => {
      stars = [];
      // Calculate density based on logical screen area to avoid excessive count on 4k
      const logicalArea = window.innerWidth * window.innerHeight;
      const numStars = Math.floor(logicalArea / 800); // Higher density (1 star per 800px^2)
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (Math.random() * 1.2 + 0.5) * dpr, // Scale radius by DPR
          baseAlpha: Math.random() * 0.5 + 0.3, // Brighter: 0.3 to 0.8 opacity
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.05 + 0.005,
        });
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.phase += star.speed;
        
        // Twinkle effect
        const alphaChange = Math.sin(star.phase) * 0.2;
        const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + alphaChange));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
        resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default StarryBackground;