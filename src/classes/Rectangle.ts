export class Rectangle {
  constructor(
    public color: string,
    public x = 0,
    public y = 0,
    public width: number,
    public height: number,
  ) {}
  getArea() {
    return this.width * this.height;
  }
  update(context: CanvasRenderingContext2D) {
    context.fillStyle = this.color;
    context.fillRect(this.x, this.y, this.width, this.height);
  }
}
