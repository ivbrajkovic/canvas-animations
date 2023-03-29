import { MutableRefObject, useEffect } from "react";
import { Circle } from "../classes/Circle";
import { Mouse } from "../classes/Mouse";
import { TailEffect } from "../classes/TailEffect";

export const useTailEffect = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
  circle = new Circle(100, 100, 30, "red"),
) => {
  useEffect(() => {
    if (!contextRef.current) return;

    const mouse = new Mouse();
    const unsubscribe = mouse.subscribeMouseMove((x, y) => {
      circle.x = x;
      circle.y = y - 15;
    });

    const effect = new TailEffect(contextRef.current);
    effect.add(circle);
    effect.start();

    return unsubscribe;
  }, []);
};
