import { Updatable } from "./types";

export class Effect<T extends Updatable> {
  protected isStarted = false;

  constructor(
    protected ctx: CanvasRenderingContext2D,
    protected objects: T[] = [],
    protected canvasWidth = ctx.canvas.width,
    protected canvasHeight = ctx.canvas.height,
  ) {}

  set setObjects(objects: T[]) {
    this.objects = objects;
  }

  add(object: T) {
    this.objects.push(object);
  }

  remove(object: T) {
    this.objects = this.objects.filter((obj) => obj !== object);
  }

  removeAt(index: number) {
    this.objects.splice(index, 1);
  }

  removeAll() {
    this.objects.length = 0;
  }

  animation(ctx: CanvasRenderingContext2D, objects: T[]) {}

  stop = () => {
    this.isStarted = false;
  };

  start = () => {
    this.isStarted = true;
    const animate = () => {
      if (!this.isStarted) return;
      this.animation(this.ctx, this.objects);
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return this.stop;
  };

  startFps = (fps = 30) => {
    const nextFrameTime = 1000 / fps;
    let lastTime = 0;
    let timer = 0;
    this.isStarted = true;

    const animate = (timeStamp: DOMHighResTimeStamp) => {
      if (!this.isStarted) return;
      const deltaTime = timeStamp - lastTime;
      lastTime = timeStamp;

      if (timer <= nextFrameTime) timer += deltaTime;
      else {
        this.animation(this.ctx, this.objects);
        timer = 0;
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    return this.stop;
  };

  startDefault = () => {
    this.isStarted = true;
    const animate = () => {
      if (!this.isStarted) return;
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      for (let i = 0; i < this.objects.length; i++) {
        this.objects[i].update(this.ctx);
      }
      requestAnimationFrame(this.startDefault);
    };
    requestAnimationFrame(animate);
    return this.stop;
  };
}
