export class Circle {
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string,
    public vx: number = 1,
    public vy: number = 1,
  ) {}

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color; // Extract for performance ???
    context.fill();
    context.closePath();
  }

  update(context: CanvasRenderingContext2D) {
    this.draw(context);
  }
}
