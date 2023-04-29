import { Mouse } from "./Mouse";
import { getDistance, randomFromRange, randomIntFromRange } from "../utility";
import { resolveCollision } from "../utility/util-elastic-collision";

export class CircleOutline {
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
    public mouseRadius: number = 120,
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
      this.mouse.getMouseDistance(this.x, this.y) < this.mouseRadius &&
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

  update(context: CanvasRenderingContext2D, others: CircleOutline[]): void {
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
