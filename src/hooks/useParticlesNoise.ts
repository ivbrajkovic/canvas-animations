import { MutableRefObject, useEffect, useState } from "react";
import { animation } from "../utility/animation";
import * as dat from "dat.gui";
import { useResizeCanvas } from "./useResizeCanvas";

const settings = {
  radius: 3,
};

class Particle {
  constructor(
    public x: number,
    public y: number,
    public radius: number,
    public color: string,
  ) {}

  draw(context: CanvasRenderingContext2D) {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
    context.closePath();
  }

  update(context: CanvasRenderingContext2D) {
    this.draw(context);
  }
}

class Particles {
  particles: Particle[] = [];
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  init = (context: CanvasRenderingContext2D) => {
    this.canvasWidth = context.canvas.width;
    this.canvasHeight = context.canvas.height;
    this.particles = Array.from({ length: 50 }, () => {
      const radius = settings.radius;
      const x = Math.random() * (this.canvasWidth - radius * 2) + radius;
      const y = Math.random() * (this.canvasHeight - radius * 2) + radius;
      const color = "blue";
      return new Particle(x, y, radius, color);
    });
  };
}

export const useParticlesNoise = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  const particles = useState(() => new Particles())[0];
  const { width, height } = useResizeCanvas(contextRef);

  useState(() => {
    const gui = new dat.GUI();
    gui.add(settings, "radius", 1, 10, 1);
  });

  useEffect(() => {
    if (!contextRef.current) return;
    const context = contextRef.current;

    particles.init(context);

    const animate = () => {
      context.fillStyle = "rgba(0, 0, 0, 0.01)";
      context.fillRect(0, 0, width, height);
      particles.particles.forEach((particle) => particle.update(context));
      particles.init(context);
    };

    const stop = animation(context, animate);

    return () => {
      console.log("stop");
      stop();
    };
  }, [width, height]);
};
