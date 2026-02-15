
import React, { useEffect, useRef } from 'react';

interface Props {
  isWarpSpeed?: boolean;
}

const StarryBackground: React.FC<Props> = ({ isWarpSpeed = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(isWarpSpeed ? 3 : 1);

  useEffect(() => {
    speedRef.current = isWarpSpeed ? 3 : 1;
  }, [isWarpSpeed]);

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
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      initStars(canvas.width, canvas.height, dpr);
    };

    const initStars = (width: number, height: number, dpr: number) => {
      stars = [];
      const logicalArea = window.innerWidth * window.innerHeight;
      const numStars = Math.floor(logicalArea / 800);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: (Math.random() * 1.2 + 0.5) * dpr,
          baseAlpha: Math.random() * 0.5 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.05 + 0.005,
        });
      }
    };

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.phase += star.speed * speedRef.current;
        const alphaChange = Math.sin(star.phase) * 0.2;
        const currentAlpha = Math.max(0.1, Math.min(1, star.baseAlpha + alphaChange));

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.fill();
        
        if (isWarpSpeed) {
           // Subtle trail effect in warp speed
           ctx.beginPath();
           ctx.moveTo(star.x, star.y);
           ctx.lineTo(star.x, star.y + (star.radius * 2));
           ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.3})`;
           ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isWarpSpeed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
};

export default StarryBackground;
