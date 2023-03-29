export const randomFromRange = (min: number, max: number) =>
  Math.random() * (max - min + 1) + min;

export const randomIntFromRange = (min: number, max: number) =>
  ~~(Math.random() * (max - min + 1) + min);

export const randomColor = () => `hsl(${Math.random() * 360}, 50%, 50%)`;

export const randomColorFromArray = (colors: string[]) =>
  colors[~~(Math.random() * colors.length)];

/**
 * Get distance between two points
 * @param x1 number
 * @param y1 number
 * @param x2 number
 * @param y2 number
 * @returns number
 */
export const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)); // Faster than Math.hypot()
};
