import merge from 'lodash/fp/merge';
import debounce from 'lodash/fp/debounce';
import { Mouse } from './mouse';
import { Particle } from './point';
import {
  PartialParticlesOptions,
  ParticlesOptions,
} from 'classes/particles/types';
import { Grid } from 'classes/particles/grid';
import { QuadTree, Rectangle } from 'classes/particles/quad-tree';

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_CANVAS_HEIGHT = 600;

const defaults: ParticlesOptions = {
  fps: { show: false, element: null },
  color: {
    opacity: 1,
    particle: { r: 255, g: 255, b: 255 },
    connection: { r: 255, g: 255, b: 255 },
  },
  connectionDistance: 120,
  lineWidth: 1,
  particleCountFactor: 12,
  particleCount: null,
};

export class Particles {
  private running = false;
  private raf: number | null = null;
  private frameCount = 0;
  private previousFpsTime = performance.now();
  private particles: Particle[] = [];
  private options = defaults;
  private mouse: Mouse = new Mouse();
  private ctx: CanvasRenderingContext2D;

  // Grid and QuadTree
  private grid: Grid;
  private quadTreeCapacity: number = 0;

  constructor(
    private canvas: HTMLCanvasElement,
    options: PartialParticlesOptions = {},
  ) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context not found');

    this.ctx = context;
    this.options = merge(defaults, options);

    // Grid and QuadTree
    this.grid = new Grid(this.options.connectionDistance);
    this.quadTreeCapacity = 4; // Capacity for each QuadTree quadrant
  }

  private tick = () => {
    if (!this.running) return;

    this.animate();
    if (this.options.fps?.show) this.updateFPSCounter(this.options.fps.element);

    this.raf = requestAnimationFrame(this.tick);
  };

  private updateFPSCounter = (element: HTMLElement, interval = 1000) => {
    const now = performance.now();
    this.frameCount++; // Increment frame count

    if (now - this.previousFpsTime < interval) return;

    const delta = (now - this.previousFpsTime) / 1000; // Time elapsed in seconds
    const fps = this.frameCount / delta; // Average FPS over the elapsed time
    element.innerText = `FPS: ${fps.toFixed(1)}`;

    // Reset for the next interval
    this.previousFpsTime = now;
    this.frameCount = 0;
  };

  private updateParticles = () => {
    for (let i = 0; i < this.particles.length; i++) {
      const point = this.particles[i];
      point.update(this.mouse); // Update particle based on mouse interaction
      point.move(this.canvas); // Move particle based on its velocity and position
    }
  };

  private animate = () => {
    // TODO: Maybe unroll the functions to avoid the overhead of function calls

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.updateParticles();
    this.drawSceneNestedLoop();
    // this.drawSceneGrid();
    // this.drawSceneQuadTree();
    this.mouse.reduceRadius(2);
  };

  private drawSceneNestedLoop = () => {
    const color = this.options.color;
    const connectionDistance = this.options.connectionDistance;
    let dx: number,
      dy: number,
      distanceSquared: number,
      connectionDistanceSquared: number,
      opacityValue: number;

    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];

      for (let j = i; j < this.particles.length; j++) {
        const particleB = this.particles[j];
        dx = particleA.x - particleB.x;
        dy = particleA.y - particleB.y;
        distanceSquared = dx * dx + dy * dy;
        connectionDistanceSquared = connectionDistance ** 2;

        if (distanceSquared < connectionDistanceSquared) {
          opacityValue =
            (1 - Math.pow(distanceSquared / connectionDistanceSquared, 0.5)) *
            color.opacity;
          this.ctx.strokeStyle = `rgba(${color.connection.r},${color.connection.g},${color.connection.b},${opacityValue})`;
          this.ctx.lineWidth = this.options.lineWidth;
          this.ctx.beginPath();
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.stroke();
        }
      }

      particleA.draw(
        this.ctx,
        `rgba(${color.particle.r},${color.particle.g},${color.particle.b},${color.opacity})`,
      );
    }
  };

  private drawSceneGrid = () => {
    this.grid.clear();
    this.grid.insertParticles(this.particles);

    const color = this.options.color;
    const connectionDistance = this.options.connectionDistance;
    let dx: number,
      dy: number,
      distanceSquared: number,
      connectionDistanceSquared: number,
      opacityValue: number;

    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];
      const nearbyParticles = this.grid.getNearbyParticles(particleA);

      for (let j = 0; j < nearbyParticles.length; j++) {
        const particleB = nearbyParticles[j];
        if (particleA === particleB) continue; // Skip self-comparison

        // Calculate squared distance to avoid expensive sqrt()
        dx = particleA.x - particleB.x;
        dy = particleA.y - particleB.y;
        distanceSquared = dx * dx + dy * dy;
        connectionDistanceSquared = connectionDistance ** 2;

        if (distanceSquared < connectionDistanceSquared) {
          opacityValue =
            (1 - Math.pow(distanceSquared / connectionDistanceSquared, 0.5)) *
            color.opacity;
          this.ctx.strokeStyle = `rgba(${color.connection.r},${color.connection.g},${color.connection.b},${opacityValue})`;
          this.ctx.lineWidth = this.options.lineWidth;
          this.ctx.beginPath();
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.stroke();
        }
      }

      // Draw points
      particleA.draw(
        this.ctx,
        `rgba(${color.particle.r},${color.particle.g},${color.particle.b},${color.opacity})`,
      );
    }
  };

  private drawSceneQuadTree = () => {
    const boundary = new Rectangle(
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width / 2,
      this.canvas.height / 2,
    );

    const quadTree = new QuadTree(boundary, this.quadTreeCapacity);
    for (let i = 0; i < this.particles.length; i++)
      quadTree.insert(this.particles[i]);

    // quadTree.draw(this.ctx);
    const color = this.options.color;
    const connectionDistance = this.options.connectionDistance;
    let dx: number,
      dy: number,
      distanceSquared: number,
      connectionDistanceSquared: number,
      opacityValue: number;

    for (let i = 0; i < this.particles.length; i++) {
      const particleA = this.particles[i];

      const nearbyParticles = quadTree.query(
        new Rectangle(
          particleA.x,
          particleA.y,
          connectionDistance,
          connectionDistance,
        ),
      );

      for (let j = 0; j < nearbyParticles.length; j++) {
        const particleB = nearbyParticles[j];
        if (particleA === particleB) continue; // Skip self-comparison

        // Calculate squared distance to avoid expensive sqrt()
        dx = particleA.x - particleB.x;
        dy = particleA.y - particleB.y;
        distanceSquared = dx * dx + dy * dy;
        connectionDistanceSquared = this.options.connectionDistance ** 2;

        if (distanceSquared < connectionDistanceSquared) {
          opacityValue =
            (1 - Math.pow(distanceSquared / connectionDistanceSquared, 0.5)) *
            color.opacity;
          this.ctx.strokeStyle = `rgba(${color.connection.r},${color.connection.g},${color.connection.b},${opacityValue})`;
          this.ctx.lineWidth = this.options.lineWidth;
          this.ctx.beginPath();
          this.ctx.moveTo(particleA.x, particleA.y);
          this.ctx.lineTo(particleB.x, particleB.y);
          this.ctx.stroke();
        }
      }

      // Draw points
      particleA.draw(
        this.ctx,
        `rgba(${color.particle.r},${color.particle.g},${color.particle.b},${color.opacity})`,
      );
    }
  };

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
    this.mouse.x = e.offsetX;
    this.mouse.y = e.offsetY;
    this.mouse.increaseRadius(10);
  };

  stop = () => {
    if (!this.running) return;
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  };
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
