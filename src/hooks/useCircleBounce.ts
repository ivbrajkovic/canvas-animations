import { MutableRefObject, useEffect } from "react";
import { CircleBounce } from "../classes/CircleBounce";
import { TailEffect } from "../classes/TailEffect";
import { randomFromRange, randomIntFromRange } from "../utility";

export const useCircleBounce = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  useEffect(() => {
    if (!contextRef.current) return;

    const balls = Array.from({ length: 40 }, () => {
      const radius = randomIntFromRange(15, 45);
      return new CircleBounce(
        randomIntFromRange(radius, window.innerWidth - radius),
        randomIntFromRange(radius, window.innerHeight - radius),
        radius,
        `hsl(${Math.random() * 360}, 50%, 50%)`,
        randomFromRange(-3, 3),
        randomFromRange(-3, 3),
      );
    });

    const effect = new TailEffect(contextRef.current, balls);
    // const stop = effect.start();
    const stop = effect.startDefault();

    return stop;
  }, []);
};
