export class Pointer {
  constructor(
    public x: number | null = null,
    public y: number | null = null,
    public radius = 120,
    public minRadius = 0,
    public maxRadius = 180,
  ) {}

  setCoordinates(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  increaseRadius(value = 1) {
    const newRadius = this.radius + value;
    this.radius = newRadius > this.maxRadius ? this.maxRadius : newRadius;
  }

  reduceRadius(value = -1) {
    const newRadius = this.radius - value;
    this.radius = newRadius < this.minRadius ? this.minRadius : newRadius;
  }
}
