export class Effect<
  T extends { update: (ctx: CanvasRenderingContext2D) => void },
> {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private canvasWidth = ctx.canvas.width,
    private canvasHeight = ctx.canvas.height,
    private objects: T[] = [],
  ) {}

  init(object: T, count: number = 400) {
    for (let i = 0; i < count; i++) {
      this.objects.push(object);
    }
  }

  add(object: T) {
    this.objects.push(object);
  }

  remove(object: T) {
    this.objects = this.objects.filter((obj) => obj !== object);
  }

  start() {
    requestAnimationFrame(this.start.bind(this));
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].update(this.ctx);
    }
  }
}
