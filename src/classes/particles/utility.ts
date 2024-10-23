/**
 * Resizes the given canvas element to match its display size.
 *
 * @param canvas - The HTMLCanvasElement to resize.
 * @param multiplier - A multiplier to apply to the canvas's client width and height. Defaults to 1.
 * @returns A boolean indicating whether the canvas was resized (true) or not (false).
 */
export const resizeCanvasToDisplaySize = (
  canvas: HTMLCanvasElement,
  multiplier: number = 1,
): boolean => {
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
};

/**
 * Resizes the canvas to fit the size of the specified element in response to a resize event.
 *
 * @param canvas - The HTMLCanvasElement to resize.
 * @param element - The HTMLElement whose size the canvas should match.
 * @returns A boolean indicating whether the canvas was resized (true) or not (false).
 */
export const resizeCanvasToFitElement = (
  canvas: HTMLCanvasElement,
  multiplier: number = 1,
): boolean => {
  const width =
    ((canvas.parentElement as HTMLElement).clientWidth * multiplier) | 0;
  const height =
    ((canvas.parentElement as HTMLElement).clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
};
