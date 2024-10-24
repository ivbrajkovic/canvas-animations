import { Particles } from 'classes/particles/particles';
import { useEffect, useRef } from 'react';

export const useParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const span = document.createElement('span');
    span.style.position = 'absolute';
    span.style.top = '0';
    span.style.backgroundColor = 'black';
    span.style.padding = '8px 16px';
    span.style.borderRadius = '4px';
    span.style.color = 'white';
    span.style.minWidth = '100px';
    document.body.appendChild(span);

    // 400 100fps
    // 800 95fps
    // 1000 60fps
    // 1200 40fps
    // 1400 33fps
    // 1500 30fps
    // 1600 27fps

    const particles = new Particles(canvas, {
      fps: { show: true, element: span },
      connectionDistance: 120,
      // particleCountFactor: 12,
      particleCount: 800,
    });
    particles.init();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) particles.start();
          else particles.stop();
        });
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(canvas);

    window.addEventListener('resize', particles.onResize);
    window.addEventListener('mousemove', particles.onMouseMove);

    return () => {
      span.remove();
      particles.stop();
      observer.disconnect();
      window.removeEventListener('resize', particles.onResize);
      window.removeEventListener('mousemove', particles.onMouseMove);
    };
  }, []);

  return { canvasRef };
};
