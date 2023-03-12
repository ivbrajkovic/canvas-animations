export const randomFromRange = (min: number, max: number) =>
  Math.random() * (max - min + 1) + min;

export const randomIntFromRange = (min: number, max: number) =>
  ~~(Math.random() * (max - min + 1) + min);

export const randomColor = () => `hsl(${Math.random() * 360}, 50%, 50%)`;

export const randomColorFromArray = (colors: string[]) =>
  colors[~~(Math.random() * colors.length)];

export const distance = (x1: number, y1: number, x2: number, y2: number) => {
  const xDist = x2 - x1;
  const yDist = y2 - y1;
  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2)); // Faster than Math.hypot()
};
