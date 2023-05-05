import { MutableRefObject, useEffect, useState } from "react";
import * as dat from "dat.gui";
import { useResizeCanvas } from "./useResizeCanvas";

const settings = {
  radius: 5,
  count: 50,
  alpha: 1.0,
  speed: 3,
  interval: 300,
};

const mouse = {
  x: 0,
  y: 0,
};

class Particle {
  endAngle: number = Math.PI * 2;
  collect: boolean = false;

  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
    public color: string,
    public speed: number,
    public radius: number,
  ) {}

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, this.endAngle, false);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }

  update(context: CanvasRenderingContext2D) {
    this.draw(context);
    this.x += this.vx * this.speed;
    this.y += this.vy * this.speed;
  }
}

class ParticlesTunnel {
  private isTicking = true;
  private hue = 0;
  private radian: number = 0;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private particles: Particle[] = [];
  private hueInterval: ReturnType<typeof setInterval> | undefined;
  private generateTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(public context: CanvasRenderingContext2D) {
    this.init();
  }

  init = () => {
    this.canvasWidth = this.context.canvas.width;
    this.canvasHeight = this.context.canvas.height;
    this.radian = (Math.PI * 2) / settings.count;
    this.particles = [];
  };

  // Generate Hue
  stopHueInterval = () => clearInterval(this.hueInterval);
  startHueInterval = () => {
    let hueRadian = 0;
    this.hueInterval = setInterval(() => {
      hueRadian += 0.01;
      this.hue = Math.sin(hueRadian) * 360;
    }, 100);
  };

  generateRing = () => {
    this.filterParticles();

    for (let i = 0; i < settings.count; i++) {
      const x = mouse.x;
      const y = mouse.y;
      const vx = Math.cos(this.radian * i);
      const vy = Math.sin(this.radian * i);
      this.particles.push(
        new Particle(
          x,
          y,
          vx,
          vy,
          `hsl(${this.hue}, 100%, 50%)`,
          settings.speed,
          settings.radius,
        ),
      );
    }
  };

  // Generate particles
  stopGenerateInterval = () => clearTimeout(this.generateTimeout);
  startGenerateInterval = () => {
    const timeoutFn = () => {
      this.generateTimeout = setTimeout(() => {
        this.generateRing();
        timeoutFn();
      }, settings.interval);
    };
    timeoutFn();
  };

  filterParticles = () => {
    this.particles = this.particles.filter((particle) => !particle.collect);
  };

  // Animation
  start = () => {
    // stop ticking
    if (!this.isTicking) return;

    // clear canvas with fade effect
    this.context.fillStyle = `rgba(0, 0, 0, ${settings.alpha})`;
    this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // if particle is out of ttl, mark it as collect
      if (
        particle.x + particle.radius < 0 ||
        particle.x - particle.radius > this.canvasWidth ||
        particle.y + particle.radius < 0 ||
        particle.y - particle.radius > this.canvasHeight
      ) {
        particle.collect = true;
        continue;
      }

      // set dynamic props
      particle.color = `hsl(${this.hue}, 100%, 50%)`;
      particle.speed = settings.speed;
      particle.radius = settings.radius;

      // update particle
      particle.update(this.context);
    }

    requestAnimationFrame(this.start);
  };

  stop = () => {
    this.isTicking = false;
    this.stopHueInterval();
    this.stopGenerateInterval();
  };
}

export const useParticlesTunnel = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  const { width, height } = useResizeCanvas(contextRef);

  useState(() => {
    const gui = new dat.GUI();
    gui.add(settings, "count", 1, 100, 1);
    gui.add(settings, "speed", 1, 10, 1);
    gui.add(settings, "radius", 1, 20, 1);
    gui.add(settings, "alpha", 0.01, 1, 0.05);
    gui.add(settings, "interval", 100, 1000, 50);
  });

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;
    const context = contextRef.current;

    const particlesTunnel = new ParticlesTunnel(context);
    particlesTunnel.startHueInterval();
    particlesTunnel.startGenerateInterval();
    particlesTunnel.start();

    return particlesTunnel.stop;
  }, [width, height]);
};
