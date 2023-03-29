import { getDistance } from "../utility";

export class Mouse {
  constructor(private x = innerWidth / 2, private y = innerHeight / 2) {}

  mouseMove = (event: MouseEvent) => {
    this.x = event.clientX;
    this.y = event.clientY;
  };

  startListening() {
    addEventListener("mousemove", this.mouseMove);
    return () => {
      removeEventListener("mousemove", this.mouseMove);
    };
  }

  subscribeMouseMove(callback: (x: number, y: number) => void) {
    const mouseMoveCallback = this.mouseMoveCallback(callback);
    addEventListener("mousemove", mouseMoveCallback);
    return () => {
      removeEventListener("mousemove", mouseMoveCallback);
    };
  }

  mouseMoveCallback =
    (callback: (x: number, y: number) => void) => (event: MouseEvent) => {
      this.x = event.clientX;
      this.y = event.clientY;
      callback(this.x, this.y);
    };

  get mousePosition() {
    return { x: this.x, y: this.y };
  }

  get mouseX() {
    return this.x;
  }

  get mouseY() {
    return this.y;
  }

  getMouseDistance(x: number, y: number) {
    return getDistance(this.x, this.y, x, y);
  }

  getMouseDistanceFromObject(object: { x: number; y: number }) {
    return getDistance(this.x, this.y, object.x, object.y);
  }

  getMouseDistanceFromObjectCenter(object: {
    x: number;
    y: number;
    radius: number;
  }) {
    return getDistance(this.x, this.y, object.x, object.y) - object.radius;
  }

  getMouseDistanceFromObjectEdge(object: {
    x: number;
    y: number;
    radius: number;
  }) {
    return getDistance(this.x, this.y, object.x, object.y) + object.radius;
  }

  getMouseDistanceFromObjectTop(object: {
    x: number;
    y: number;
    radius: number;
  }) {
    return getDistance(this.x, this.y, object.x, object.y - object.radius);
  }

  getMouseDistanceFromObjectBottom(object: {
    x: number;
    y: number;
    radius: number;
  }) {
    return getDistance(this.x, this.y, object.x, object.y + object.radius);
  }

  getMouseDistanceFromObjectLeft(object: {
    x: number;
    y: number;
    radius: number;
  }) {
    return getDistance(this.x, this.y, object.x - object.radius, object.y);
  }

  getMouseDistanceFromObjectRight(object: {
    x: number;
    y: number;
    radius: number;
  }) {
    return getDistance(this.x, this.y, object.x + object.radius, object.y);
  }
}
