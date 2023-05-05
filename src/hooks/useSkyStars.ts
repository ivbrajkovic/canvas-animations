import { MutableRefObject, useEffect } from "react";
import { useResizeCanvas } from "./useResizeCanvas";

const settings = {
  count: 400,
  size: 1,
  radius: 1,
  opacity: 1,
  speed: 0.5,
  straight: false,
};

let isMouseDown = false;

class Particle {
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string,
  ) {}

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }

  update(context: CanvasRenderingContext2D) {
    this.draw(context);
  }
}

class Particles {
  isTick = false;
  canvasWidth = 0;
  canvasHeight = 0;
  canvas: HTMLCanvasElement | null = null;
  rotateRadians = 0;
  velocity = 0.0;
  hypot = 0;
  hypotHalf = 0;

  constructor(
    public particles: Particle[],
    public context: CanvasRenderingContext2D,
  ) {}

  init() {
    this.isTick = true;
    this.canvas = this.context.canvas;
    this.canvasWidth = this.canvas.width;
    this.canvasHeight = this.canvas.height;
    this.hypot = Math.hypot(this.canvasWidth, this.canvasHeight);
    this.hypotHalf = this.hypot / 2;
    this.createParticles();
  }

  createParticle() {
    const x = Math.floor(Math.random() * this.hypot + 1) - this.hypotHalf;
    const y = Math.floor(Math.random() * this.hypot + 1) - this.hypotHalf;
    const radius = Math.random() * 2;
    const color = "white";
    this.particles.push(new Particle(x, y, radius, color));
  }

  createParticles() {
    this.particles = [];
    for (let i = 0; i < settings.count; i++) {
      this.createParticle();
    }
  }

  draw = () => {
    this.particles.forEach((particle) => {
      particle.update(this.context);
    });
  };

  animate = () => {
    if (!this.isTick) return;
    this.context.fillStyle = "rgba(0, 0, 0, 0.1)";
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.context.save();

    this.context.translate(this.canvasWidth / 2, this.canvasHeight / 2);
    this.context.rotate(this.rotateRadians);

    if (isMouseDown) {
      this.rotateRadians += this.velocity;
      if (this.velocity < 0.01) this.velocity += 0.0001;
    } else {
      this.rotateRadians += this.velocity;
      if (this.velocity > 0) this.velocity -= 0.0005;
      if (this.velocity < 0) this.velocity = 0;
    }

    this.draw();

    this.context.restore();

    requestAnimationFrame(this.animate);
  };

  stop = () => {
    this.isTick = false;
  };

  static create(context: CanvasRenderingContext2D) {
    return new Particles([], context);
  }

  static init(context: CanvasRenderingContext2D) {
    const particles = Particles.create(context);
    particles.init();
    return particles;
  }
}

export const useSkyStars = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  const { width, height } = useResizeCanvas(contextRef);

  useEffect(() => {
    const handleMouseDown = () => (isMouseDown = true);
    const handleMouseUp = () => (isMouseDown = false);
    addEventListener("mousedown", handleMouseDown);
    addEventListener("mouseup", handleMouseUp);
    return () => {
      removeEventListener("mousedown", handleMouseDown);
      removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;
    const particles = Particles.init(contextRef.current);
    particles.animate();

    return particles.stop;
  }, [width, height]);
};
