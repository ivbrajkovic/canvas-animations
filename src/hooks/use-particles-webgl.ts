import { compileShader, createProgram } from 'classes/particles-webgl/utility';
import { useEffect, useRef } from 'react';

import vertex from '../classes/particles-webgl/vertex.glsl?raw';
import fragment from '../classes/particles-webgl/fragment.glsl?raw';

const NUM_PARTICLES = 1000;
const PARTICLE_SPEED = 50.0;

export const useParticlesWebGL = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');

    // Shaders ----------------------------------------------------------

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertex, gl);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragment, gl);
    const program = createProgram(vertexShader, fragmentShader, gl);
    gl.useProgram(program);

    const initializeParticles = (numParticles: number) => {
      const positions = new Float32Array(numParticles * 2);
      const velocities = new Float32Array(numParticles * 2);
      const sizes = new Float32Array(numParticles);

      for (let i = 0; i < numParticles; i++) {
        // Random positions between -1 and 1
        positions[i * 2] = Math.random() * 2 - 1;
        positions[i * 2 + 1] = Math.random() * 2 - 1;

        // Random velocities
        velocities[i * 2] = (Math.random() - 0.5) * 0.01;
        velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.01;

        // Random sizes
        sizes[i] = Math.random() * 5 + 1;
      }

      return { positions, velocities, sizes };
    };

    const { positions, velocities, sizes } = initializeParticles(NUM_PARTICLES);

    // Buffers ----------------------------------------------------------

    // Create position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

    // Create velocity buffer
    const velocityBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, velocities, gl.STATIC_DRAW);

    // Create size buffer
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);

    // Attributes ----------------------------------------------------------

    // Enable and set position attribute
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Enable and set velocity attribute
    const velocityLocation = gl.getAttribLocation(program, 'a_velocity');
    gl.bindBuffer(gl.ARRAY_BUFFER, velocityBuffer);
    gl.enableVertexAttribArray(velocityLocation);
    gl.vertexAttribPointer(velocityLocation, 2, gl.FLOAT, false, 0, 0);

    // Enable and set size attribute
    const sizeLocation = gl.getAttribLocation(program, 'a_size');
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

    // Uniforms ----------------------------------------------------------

    // Get uniform locations
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const speedLocation = gl.getUniformLocation(program, 'u_speed');

    const drawParticles = (time: number) => {
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Set the time and speed uniforms
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform1f(speedLocation, PARTICLE_SPEED);

      // Draw particles
      gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);
    };

    const createFPSCounter = () => {
      const span = document.createElement('span');
      span.style.position = 'absolute';
      span.style.top = '0';
      span.style.backgroundColor = 'black';
      span.style.padding = '8px 16px';
      span.style.borderRadius = '4px';
      span.style.color = 'white';
      span.style.minWidth = '100px';
      document.body.appendChild(span);
      return span;
    };

    const span = createFPSCounter();

    let frameCount = 0,
      previousFpsTime = performance.now();

    const updateFPSCounter = (element: HTMLElement, interval = 1000) => {
      const now = performance.now();
      frameCount++; // Increment frame count

      if (now - previousFpsTime < interval) return;

      const delta = (now - previousFpsTime) / 1000; // Time elapsed in seconds
      const fps = frameCount / delta; // Average FPS over the elapsed time
      element.innerText = `FPS: ${fps.toFixed(1)}`;

      // Reset for the next interval
      previousFpsTime = now;
      frameCount = 0;
    };

    let raf: number;

    const animate = (time: number) => {
      drawParticles(time);
      updateFPSCounter(span);
      // raf = requestAnimationFrame(animate);
    };

    // Start the animation
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(velocityBuffer);
      gl.deleteBuffer(sizeBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      span.remove();
    };
  }, []);

  return { canvasRef };
};
