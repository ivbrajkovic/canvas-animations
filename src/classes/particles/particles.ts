import merge from 'lodash/fp/merge';
import debounce from 'lodash/fp/debounce';
import { Pointer } from './pointer';
import { Particle } from './point';
import {
  PartialParticlesOptions,
  ParticlesOptions,
} from 'classes/particles/types';

const LINE_WIDTH = 2;
const PARTICLE_COUNT_FACTOR = 12;
const CONNECT_DISTANCE = 120;
const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;

const defaults: ParticlesOptions = {
  fps: { show: false, element: null },
  color: {
    opacity: 0,
    maxOpacity: 1,
    minOpacity: 0,
    particle: { r: 255, g: 255, b: 255 },
    connection: { r: 255, g: 255, b: 255 },
  },
  connectionDistance: CONNECT_DISTANCE,
  lineWidth: LINE_WIDTH,
  particleCountFactor: PARTICLE_COUNT_FACTOR,
  particleCount: null,
};

export class Particles {
  private running: boolean;
  private ctx: CanvasRenderingContext2D;
  private raf: number | null;
  private previousSeconds: number;
  private previousFpsTimestamp: number;
  private particles: Particle[];
  private pointer: Pointer;
  private options: ParticlesOptions;

  constructor(
    private canvas: HTMLCanvasElement,
    options: PartialParticlesOptions = {},
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context not found');

    this.ctx = context;
    this.raf = null;
    this.running = false;
    this.previousSeconds = 0;
    this.previousFpsTimestamp = 0;
    this.particles = [];
    this.pointer = new Pointer();
    this.options = merge(defaults, options);
  }

  private tick = (time: number) => {
    // Stop animation if not running and opacity is 0
    if (!this.running && this.options.color.opacity <= 0) {
      this.raf = null;
      return;
    }

    const seconds = time * 0.001;
    const elapsedTime = seconds - this.previousSeconds;
    this.previousSeconds = seconds;

    this.fadeAnimation(elapsedTime);
    this.animate();

    if (this.options.fps?.show)
      this.updateFPSCounter(elapsedTime, this.options.fps.element);

    this.raf = requestAnimationFrame(this.tick);
  };

  private updateFPSCounter = (
    elapsedTime: number,
    element: HTMLElement,
    interval = 1000,
  ) => {
    const now = Date.now();
    if (now - this.previousFpsTimestamp < interval) return;
    element.innerText = `FPS: ${(1 / elapsedTime).toFixed(1)}`;
    this.previousFpsTimestamp = now;
  };

  fadeAnimation = (elapsedTime: number) => {
    if (elapsedTime > 0.2) elapsedTime = 0.016; // Smooth fade on restart animation

    const { opacity, maxOpacity, minOpacity } = this.options.color;
    if (this.running && opacity < maxOpacity) {
      this.options.color.opacity = Math.min(opacity + elapsedTime, maxOpacity);
    } else if (!this.running && opacity > 0) {
      this.options.color.opacity = Math.max(opacity - elapsedTime, minOpacity);
    }
  };

  private animate = () => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawScene();
    this.pointer.reduceRadius(2);
  };

  private drawScene() {
    const { connectionDistance: distanceThreshold, color } = this.options;
    let dx, dy, distance, opacityValue;

    for (let i = 0; i < this.particles.length; i++) {
      // Connect points
      for (let j = i; j < this.particles.length; j++) {
        dx = this.particles[i].x - this.particles[j].x;
        dy = this.particles[i].y - this.particles[j].y;
        // distance = Math.hypot(dx, dy);
        distance = Math.sqrt(dx * dx + dy * dy); // 2 time faster

        // In threshold distance
        if (distance < distanceThreshold) {
          opacityValue =
            (1 - distance / distanceThreshold) * color.opacity || 0;
          this.ctx.strokeStyle = `rgba(${color.connection.r},${color.connection.g},${color.connection.b},${opacityValue})`;
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }

      // Draw points
      this.particles[i].draw(
        this.ctx,
        `rgba(${color.particle.r},${color.particle.g},${color.particle.b},${color.opacity})`,
      );
      this.particles[i].update(this.pointer);
      this.particles[i].move(this.canvas);
    }
  }

  private resizeCanvasToFitParent = () => {
    const pixelRatio = window.devicePixelRatio;
    const canvasParent = this.canvas.parentElement;
    const parentWidth = canvasParent?.clientWidth ?? DEFAULT_CANVAS_WIDTH;
    const parentHeight = canvasParent?.clientHeight ?? DEFAULT_CANVAS_HEIGHT;
    this.canvas.width = parentWidth * pixelRatio;
    this.canvas.height = parentHeight * pixelRatio;
  };

  private initializeParticles = () => {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const particleCount =
      this.options.particleCount ??
      Math.ceil(((width + height) / 100) * this.options.particleCountFactor);
    this.particles = Array.from(
      { length: particleCount },
      () => new Particle(width, height),
    );
  };

  init = () => {
    this.resizeCanvasToFitParent();
    this.initializeParticles();
  };

  onResize = debounce(250, this.init);
  onMouseMove = (e: MouseEvent) => {
    this.pointer.x = e.offsetX;
    this.pointer.y = e.offsetY;
    this.pointer.increaseRadius(10);
  };

  stop = () => (this.running = false);
  start = () => {
    this.running = true;
    this.raf = requestAnimationFrame(this.tick);
  };
  pause = () => {
    if (!this.running || !this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = null;
  };

  showFPS = () => this.options.fps && (this.options.fps.show = true);
  hideFPS = () => this.options.fps && (this.options.fps.show = false);
}
