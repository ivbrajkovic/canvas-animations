import { MutableRefObject, useEffect, useRef, useState } from "react";
import * as dat from "dat.gui";

const settings = {
  alphaDecay: 0.005,
  fiction: 0.99,
  gravity: 0.01,
  count: 400,
  radius: 3,
  vx: 4,
  vy: 4,
};

class Particle {
  alpha: number;
  color: string;
  constructor(
    public x: number,
    public y: number,
    public vx: number,
    public vy: number,
  ) {
    this.alpha = 1;
    this.color = `hsl(${Math.random() * 360}, 50%, 50%)`;
  }
  draw(context: CanvasRenderingContext2D) {
    context.save();
    context.globalAlpha = this.alpha;
    context.beginPath();
    context.arc(this.x, this.y, settings.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
    context.restore();
  }
  update(context: CanvasRenderingContext2D) {
    this.draw(context);
    this.x += this.vx;
    this.vx *= settings.fiction;

    // this.y += this.vy * settings.fiction + Math.exp(settings.gravity);
    this.vy *= settings.fiction;
    this.y += this.vy + Math.exp(settings.gravity);

    this.alpha -= settings.alphaDecay;
  }
}

const animate = (context: CanvasRenderingContext2D, particles: Particle[]) => {
  let isRunning = true;
  const animation = () => {
    if (!isRunning) return;
    context.fillStyle = "rgba(0, 0, 0, 0.04)";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    particles.forEach((particle, i) => {
      particle.update(context);
      if (particle.alpha <= 0) particles.splice(i, 1);
    });
    requestAnimationFrame(animation);
  };
  animation();
  return () => {
    isRunning = false;
  };
};

const createParticles = (amount: number, particles: Particle[]) => {};

export const useFireworks = (
  canvasRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  const particlesRef = useRef<Particle[]>([]);
  useState(() => {
    const gui = new dat.GUI();
    gui.add(settings, "alphaDecay", 0, 0.1, 0.001);
    gui.add(settings, "fiction", 0.9, 1, 0.01);
    gui.add(settings, "gravity", 0, 1, 0.01);
    gui.add(settings, "count", 1, 1000, 1);
    gui.add(settings, "radius", 1, 25, 1);
    gui.add(settings, "vx", 1, 100, 1);
    gui.add(settings, "vy", 1, 100, 1);
  });
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!particlesRef.current) return;
      const particles = particlesRef.current;
      for (let i = 0; i < settings.count; i++) {
        particles.push(
          new Particle(
            event.clientX,
            event.clientY,
            settings.vx * Math.sin(i) * Math.random(),
            settings.vy * Math.cos(i) * Math.random(),
          ),
        );
      }
    };
    const canvas = document.getElementsByTagName("canvas")[0];
    canvas.addEventListener("click", onClick);
    return () => {
      canvas.removeEventListener("click", onClick);
    };
  }, []);
  useEffect(() => {
    if (!canvasRef.current) return;
    return animate(canvasRef.current, particlesRef.current);
  }, []);
};
