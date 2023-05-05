import { MutableRefObject, useEffect, useState } from "react";

const DEBOUNCE_TIME = 500;

export const useResizeCanvas = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  const [state, setState] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    if (!contextRef.current) return;
    const context = contextRef.current;
    const canvas = context.canvas;

    const handler = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      setState({ width: canvas.width, height: canvas.height });
    };

    let timeout = 0;
    const debouncedHandler = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handler, DEBOUNCE_TIME);
    };

    addEventListener("resize", debouncedHandler);
    return () => {
      removeEventListener("resize", debouncedHandler);
    };
  }, []);

  return state;
};
