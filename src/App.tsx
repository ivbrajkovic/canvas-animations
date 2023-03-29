import { MutableRefObject, useEffect, useReducer, useRef } from "react";
import { Circle } from "./classes/Circle";
import { CircleBounce } from "./classes/CircleBounce";
import { Effect } from "./classes/Effect";
import { Mouse } from "./classes/Mouse";
import { TailEffect } from "./classes/TailEffect";
import { useTailEffect } from "./hooks/useBallTrail";
import { useCanvas } from "./hooks/useCanvas";
import { useCircleBounce } from "./hooks/useCircleBounce";
import { useGravityBall } from "./hooks/useGravityBall";
import { useSimpleCollision } from "./useSimpleCollision";
import { getDistance } from "./utility";

function App() {
  const { canvasRef, contextRef } = useCanvas();

  // useGravityBall(contextRef);
  // useCircleBounce(40, contextRef);
  // useTailEffect(contextRef);
  // useSimpleCollision(contextRef);

  useEffect(() => {
    if (!contextRef.current) return;

    const c1 = new Circle(400, 400, 120, "red");
    const c2 = new Circle(200, 100, 30, "blue");

    const m = new Mouse();
    m.subscribeMouseMove((x, y) => {
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

    effect.start();
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
