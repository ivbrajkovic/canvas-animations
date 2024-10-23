import { MutableRefObject, useEffect, useRef } from 'react';
import { Circle } from '../classes/Circle';
import { CircleOutline } from '../classes/CircleOutline';
import { getDistance, randomFromRange, randomIntFromRange } from '../utility';
import { Mouse } from '../classes/Mouse';
import { Effect } from '../classes/Effect';

const PARTICLE_COUNT = 80;
const MIN_RADIUS = 25;
const MAX_RADIUS = 25;
const MIN_MASS = 1;
const MAX_MASS = 1;
const MIN_VELOCITY = 0.5;
const MAX_VELOCITY = 0.5;

const initParticles = (
  width: number,
  height: number,
  particles: CircleOutline[],
) => {
  particles.length = 0;

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const mass = 3; // randomFromRange(MIN_MASS, MAX_MASS);
    const radius = randomIntFromRange(MIN_RADIUS, MAX_RADIUS);
    let x = randomIntFromRange(radius, width - radius);
    let y = randomIntFromRange(radius, height - radius);

    if (i > 0) {
      for (let j = 0; j < particles.length; j++) {
        const distance = getDistance(x, y, particles[j].x, particles[j].y);
        if (distance - radius * 2 < 0) {
          x = randomIntFromRange(radius, width - radius);
          y = randomIntFromRange(radius, height - radius);
          j = -1;
        }
      }
    }

    particles.push(
      new CircleOutline(
        x,
        y,
        radius,
        `hsl(${Math.random() * 360}, 50%, 50%)`,
        randomFromRange(-MIN_VELOCITY, MAX_VELOCITY),
        randomFromRange(-MIN_VELOCITY, MAX_VELOCITY),
        mass,
        200,
      ),
    );
  }
};

export const useCircleOutline = (
  contextRef: MutableRefObject<CanvasRenderingContext2D | undefined>,
) => {
  const particlesRef = useRef<CircleOutline[]>([]);

  useEffect(() => {
    if (!contextRef.current) return;

    const width = contextRef.current.canvas.width;
    const height = contextRef.current.canvas.height;

    initParticles(width, height, particlesRef.current);

    // const m = new Mouse();
    // m.subscribeMouseMove((x, y) => {});

    const effect = new Effect(contextRef.current, particlesRef.current);

    effect.animation = (ctx) => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particlesRef.current[i].update(ctx, particlesRef.current);
      }
    };

    effect.start();
  }, []);
};
