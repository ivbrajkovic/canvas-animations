import { useEffect, useRef } from "react";

export const useCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Canvas is not defined");

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Context is not defined");

    const height = (canvas.height = window.innerHeight);
    const width = (canvas.width = window.innerWidth);

    contextRef.current = context;
  }, []);

  return { canvasRef, contextRef };
};
