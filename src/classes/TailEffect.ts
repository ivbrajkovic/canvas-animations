import { Effect } from "./Effect";
import { Updatable } from "./types";

export class TailEffect<T extends Updatable> extends Effect<T> {
  constructor(ctx: CanvasRenderingContext2D, objects: T[] = []) {
    super(ctx);
    this.objects = objects;
  }

  animation(ctx: CanvasRenderingContext2D, objects: T[]) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    for (let i = 0; i < objects.length; i++) {
      objects[i].update(ctx);
    }
  }
}
