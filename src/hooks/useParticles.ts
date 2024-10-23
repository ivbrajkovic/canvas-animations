import { Particles } from 'classes/particles/particles';
import { useEffect, useRef } from 'react';

export const useParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.backgroundColor = 'black';
    span.style.padding = '8px 16px';
    span.style.borderRadius = '4px';
    span.style.color = 'white';
    span.style.minWidth = '100px';
    document.body.appendChild(span);

    const particles = new Particles(canvas, {
      fps: { show: true, element: span },
      connectionDistance: 120,
      particleCountFactor: 8,
      // particleCount: 100,
    });
    particles.init();
    particles.start();

    window.addEventListener('resize', particles.onResize);
    window.addEventListener('mousemove', particles.onMouseMove);

    return () => {
      particles.stop();
      window.removeEventListener('resize', particles.onResize);
      window.removeEventListener('mousemove', particles.onMouseMove);
    };
  }, []);

  return { canvasRef };
};
