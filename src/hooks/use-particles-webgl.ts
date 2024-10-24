import { useEffect, useRef } from 'react';

export const useParticlesWebGL = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) throw new Error('WebGL not supported');


    
  }, []);

  return { canvasRef };
};
