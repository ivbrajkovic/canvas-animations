import { MutableRefObject, useEffect } from "react";
import { Circle } from "./classes/Circle";
import { Effect } from "./classes/Effect";
import { Mouse } from "./classes/Mouse";
import { getDistance } from "./utility";

export const useSimpleCollision = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  useEffect(() => {
    if (!contextRef.current) return;

    const c1 = new Circle(400, 400, 120, "red");
    const c2 = new Circle(200, 100, 30, "blue");

    const m = new Mouse();
    const unsubscribe = m.subscribeMouseMove((x, y) => {
      c2.x = x;
      c2.y = y;
    });

    const effect = new Effect(contextRef.current, [c1, c2]);

    effect.animation = (ctx) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      c1.draw(ctx);
      c2.draw(ctx);

      if (getDistance(c1.x, c1.y, c2.x, c2.y) < c1.radius + c2.radius) {
        c1.color = "green";
      } else {
        c1.color = "red";
      }
    };

    const stop = effect.start();

    return () => {
      unsubscribe();
      stop();
    };
  }, []);
};
