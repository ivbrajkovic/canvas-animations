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
import { getDistance, randomFromRange, randomIntFromRange } from "./utility";
import { resolveCollision } from "./utility/util-elastic-collision";

const PARTICLE_COUNT = 100;
const MIN_RADIUS = 25;
const MAX_RADIUS = 25;
const MIN_MASS = 1;
const MAX_MASS = 1;
const MIN_VELOCITY = 0.5;
const MAX_VELOCITY = 0.5;

const particles: CircleOutline[] = [];

class CircleOutline {
  velocity: { x: number; y: number };
  mouse: Mouse;
  opacity: number = 0;
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string,
    vx: number = 1,
    vy: number = 1,
    public mass: number = 1,
  ) {
    this.velocity = { x: vx, y: vy };
    this.mouse = new Mouse();
    this.mouse.startListening();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    ctx.closePath();
  }

  move(context: CanvasRenderingContext2D) {
    if (
      this.x + this.radius > context.canvas.width ||
      this.x - this.radius < 0
    ) {
      this.velocity.x = -this.velocity.x;
    }

    if (
      this.y + this.radius > context.canvas.height ||
      this.y - this.radius < 0
    ) {
      this.velocity.y = -this.velocity.y;
    }

    // mouse collision detection

    if (
      this.mouse.getMouseDistance(this.x, this.y) < 120 &&
      this.opacity <= 0.2
    ) {
      this.opacity += 0.02;
    } else if (this.opacity > 0) {
      this.opacity -= 0.02;
      if (this.opacity < 0) this.opacity = 0;
    }

    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }

  updateCollision(
    context: CanvasRenderingContext2D,
    others: CircleOutline[],
  ): void {
    for (let i = 0; i < others.length; i++) {
      if (this === others[i]) continue;

      const distance = getDistance(this.x, this.y, others[i].x, others[i].y);
      if (distance - this.radius - others[i].radius < 0) {
        resolveCollision(this, others[i]);
      }
    }

    this.draw(context);
    this.move(context);
  }
}

function App() {
  const { canvasRef, contextRef } = useCanvas();

  // useGravityBall(contextRef);
  // useCircleBounce(40, contextRef);
  // useTailEffect(contextRef);
  // useSimpleCollision(contextRef);

  useEffect(() => {
    if (!contextRef.current) return;

    const width = contextRef.current.canvas.width;
    const height = contextRef.current.canvas.height;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mass = 3; // randomFromRange(MIN_MASS, MAX_MASS);
      const radius = randomIntFromRange(MIN_RADIUS, MAX_RADIUS);
      let x = randomIntFromRange(radius, width - radius);
      let y = randomIntFromRange(radius, height - radius);

      if (i > 0) {
        for (let j = 0; j < particles.length; j++) {
          const distance = getDistance(x, y, particles[j].x, particles[j].y);
          if (distance - radius * 2 < 0) {
            x = randomIntFromRange(radius, width - radius);
            y = randomIntFromRange(radius, height - radius);
            j = -1;
          }
        }
      }

      particles.push(
        new CircleOutline(
          x,
          y,
          radius,
          `hsl(${Math.random() * 360}, 50%, 50%)`,
          randomFromRange(-MIN_VELOCITY, MAX_VELOCITY),
          randomFromRange(-MIN_VELOCITY, MAX_VELOCITY),
          mass,
        ),
      );
    }

    const m = new Mouse();
    m.subscribeMouseMove((x, y) => {});

    const effect = new Effect(contextRef.current, particles);

    effect.animation = (ctx) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles[i].updateCollision(ctx, particles);
      }

      // c1.draw(ctx);
      // c2.draw(ctx);

      // if (getDistance(c1.x, c1.y, c2.x, c2.y) < c1.radius + c2.radius) {
      //   c1.color = "green";
      // } else {
      //   c1.color = "red";
      // }
    };

    effect.start();
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}

export default App;
