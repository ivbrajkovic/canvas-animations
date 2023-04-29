import { MutableRefObject, useEffect } from "react";
import { Updatable } from "../classes/types";
import { randomColorFromArray, randomIntFromRange } from "../utility";

const colors = ["#00dbff", "#4d39ce", "#088eff"];

type MousePoint = {
  x: number;
  y: number;
};

class Particle {
  lastPoint: { x: number; y: number };
  lastMouse: { x: number; y: number };
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string,
    public v: number = 0.05,
    public radians: number = Math.random() * Math.PI * 2,
    private readonly distance: number = randomIntFromRange(50, 120),
  ) {
    this.lastPoint = { x: x, y: y };
    this.lastMouse = { x: x, y: y };
  }
  draw = (context: CanvasRenderingContext2D) => {
    context.beginPath();

    // Effect 1
    // context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    // context.fillStyle = this.color;
    // context.fill();

    // Effect 2
    // context.strokeStyle = this.color;
    // context.moveTo(this.x, this.y);
    // context.lineTo(this.originalX, this.originalY);
    // context.stroke();

    // Effect 3
    context.strokeStyle = this.color;
    context.lineWidth = this.radius;
    context.moveTo(this.lastPoint.x, this.lastPoint.y);
    context.lineTo(this.x, this.y);
    context.stroke();

    context.closePath();
  };
  update = (context: CanvasRenderingContext2D, mouse: MousePoint) => {
    this.lastPoint = { x: this.x, y: this.y };
    // this.lastMouse = { x: mouse.x, y: mouse.y };

    // Move points over time
    this.radians += this.v;

    // Drag effect
    this.lastMouse.x += (mouse.x - this.lastMouse.x) * 0.05;
    this.lastMouse.y += (mouse.y - this.lastMouse.y) * 0.05;

    // Circular motion
    this.x = this.lastMouse.x + Math.cos(this.radians) * this.distance;
    this.y = this.lastMouse.y + Math.sin(this.radians) * this.distance;

    // this.x =
    //   this.originalX + Math.cos(this.radians) * randomIntFromRange(50, 100);
    // this.y =
    //   this.originalY + Math.sin(this.radians) * randomIntFromRange(50, 100);

    this.draw(context);
  };
}

const init = (count: number, mouse: MousePoint) => {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const radius = randomIntFromRange(1, 2);
    const color = randomColorFromArray(colors);
    particles.push(new Particle(mouse.x, mouse.y, radius, color));
  }
  return particles;
};

const animate = <T extends Updatable>(
  context: CanvasRenderingContext2D,
  particles: T[],
  mouse: { x: number; y: number },
) => {
  let isRunning = true;
  const animation = () => {
    if (!isRunning) return;
    context.fillStyle = "rgba(255, 255, 255, 0.05)";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    particles.forEach((particle) => {
      particle.update(context, mouse);
    });
    requestAnimationFrame(animation);
  };
  requestAnimationFrame(animation);
  return () => (isRunning = false);
};

export const useCircularMotion = (
  ctx: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  useEffect(() => {
    if (!ctx.current) return;

    const mouse = {
      x: ctx.current.canvas.width / 2,
      y: ctx.current.canvas.height / 2,
    };
    const updateMouse = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    window.addEventListener("mousemove", updateMouse);

    const particles = init(50, mouse);
    const stop = animate(ctx.current!, particles, mouse);

    return () => {
      stop();
      window.removeEventListener("mousemove", updateMouse);
    };
  }, []);
};
