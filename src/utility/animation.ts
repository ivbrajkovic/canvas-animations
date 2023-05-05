export const animation = (
  context: CanvasRenderingContext2D,
  callback: (context: CanvasRenderingContext2D) => void,
) => {
  let isTicking = true;
  const tick = () => {
    if (!isTicking) return;
    callback(context);
    requestAnimationFrame(tick);
  };
  tick();
  return () => {
    isTicking = false;
  };
};
