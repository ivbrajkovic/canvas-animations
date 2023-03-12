import { MutableRefObject, useEffect, useReducer, useRef } from "react";
import { Circle } from "./classes/Circle";
import { Effect } from "./classes/Effect";
import { Mouse } from "./classes/Mouse";
import { useCanvas } from "./hooks/useCanvas";

const useGravityBall = (
  ctxRef?: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  useEffect(() => {
    if (!ctxRef) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const ball = {
      x: 100,
      y: 100,
      vx: 5,
      vy: 2,
      radius: 25,
      color: "blue",
      draw: function () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = this.color;
        ctx.fill();
      },
    };

    const gravity = 0.1;
    const friction = 0.9;

    const update = () => {
      if (ball.y + ball.vy + ball.radius > ctx.canvas.height) {
        ball.vy = -ball.vy * friction;
      } else {
        ball.vy += gravity;
      }

      const dx = ball.x + ball.vx + ball.radius;

      if (dx > ctx.canvas.width || dx < ball.radius) {
        ball.vx = -ball.vx;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;
    };

    const loop = () => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ball.draw();
      update();
      requestAnimationFrame(loop);
    };

    loop();
  }, []);
};

const M = () => {
  useEffect(() => {
    const mouse = new Mouse();
    const unsubscribe = mouse.subscribeMouseMove((x, y) => {
      console.log("Mouse move", x, y);
    });
    return unsubscribe;
  }, []);

  return <div id="mouse">Mouse</div>;
};

function App() {
  const [show, toggleShow] = useReducer((s) => !s, true);
  const { canvasRef, contextRef } = useCanvas();
  // const useGravityBallRef = useGravityBall(contextRef);

  useEffect(() => {
    if (!contextRef.current) return;
    const circle = new Circle(100, 100, 30, "red");

    const mouse = new Mouse();
    const unsubscribe = mouse.subscribeMouseMove((x, y) => {
      circle.x = x;
      circle.y = y - 15;
    });

    const effect = new Effect(contextRef.current);
    effect.add(circle);
    effect.start();

    return unsubscribe;
  }, []);

  return (
    <>
      <button onClick={toggleShow}>Toggle</button>
      {/* {show ? <M /> : null} */}
      <canvas ref={canvasRef}></canvas>
    </>
  );
}

export default App;
