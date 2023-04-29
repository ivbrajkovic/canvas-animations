import { MutableRefObject, useEffect } from "react";
import { Mouse } from "../classes/Mouse";
import { Rectangle } from "../classes/Rectangle";
import { Effect } from "../classes/Effect";

export const useRectangleCollision = (
  ctx: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  useEffect(() => {
    if (!ctx.current) return;
    const width = ctx.current?.canvas.width;
    const height = ctx.current?.canvas.height;
    if (!width || !height) return;

    const blueRect = new Rectangle("blue", 300, 300, 100, 100);
    const redRect = new Rectangle("red", 50, 50, 100, 100);

    const mouse = new Mouse();
    const unsubscribeMouseMove = mouse.subscribeMouseMove((x, y) => {
      redRect.x = x;
      redRect.y = y;
    });

    const effect = new Effect(ctx.current, [blueRect, redRect]);
    effect.startDefault();

    return () => {
      unsubscribeMouseMove();
    };
  }, []);
};
