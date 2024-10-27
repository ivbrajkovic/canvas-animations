import { compileShader, createProgram } from 'webgl/particles/utility';
import { useEffect, useRef } from 'react';

import vertex from './vertex.glsl?raw';
import fragment from './fragment.glsl?raw';
import vertexForce from './vertex-force.glsl?raw';
import fragmentForce from './fragment-force.glsl?raw';

// Particle render shaders
const vertexRender = `#version 300 es
precision highp float;

uniform sampler2D u_particleData;
uniform int u_numParticles;

layout(location = 0) in float a_particleIndex;

void main() {
    vec4 particle = texelFetch(u_particleData, ivec2(int(a_particleIndex), 0), 0);
    vec2 position = particle.xy;

    gl_Position = vec4(position, 0.0, 1.0);
    gl_PointSize = 5.0; // Adjust the point size as needed
}
`;

const fragmentRender = `#version 300 es
precision mediump float;

out vec4 outColor;

void main() {
    outColor = vec4(1.0); // Render white particles
}
`;

const NUM_PARTICLES = 1000;
const PARTICLE_SPEED = 50.0;

const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

const initCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const canvas = canvasRef.current;
  if (!canvas) throw new Error('Canvas not found');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('WebGL2 not supported');

  return gl;
};

const createCounterElement = () => {
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

const createCounterElementFactory = () => {
  let frameCount = 0,
    previousFpsTime = performance.now();

  return (element: HTMLElement, interval = 1000) => {
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
};

const animationFrameLoop = (
  gl: WebGL2RenderingContext,
  callback: (time: number) => void,
  start = true,
) => {
  let raf: number;

  const animate = (time: number) => {
    callback(time);
    if (start) raf = requestAnimationFrame(animate);
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  requestAnimationFrame(animate);

  return () => {
    cancelAnimationFrame(raf);
  };
};

export const useParticlesWebGL = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const gl = initCanvas(canvasRef);

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

    const counterElement = createCounterElement();
    const updateCounterElement = createCounterElementFactory();

    const stop = animationFrameLoop(
      gl,
      (time) => {
        drawParticles(time);
        updateCounterElement(counterElement);
      },
      false,
    );

    return () => {
      // cancelAnimationFrame(raf);
      stop();
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(velocityBuffer);
      gl.deleteBuffer(sizeBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      counterElement.remove();
    };
  }, []);

  return { canvasRef };
};

export const useParticlesWebGLForce = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const gl = initCanvas(canvasRef);

    const extColorBufferFloat = gl.getExtension('EXT_color_buffer_float');
    if (!extColorBufferFloat) {
      throw new Error('EXT_color_buffer_float not supported');
    }

    // Shaders ----------------------------------------------------------

    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexForce, gl);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentForce, gl);
    const program = createProgram(vertexShader, fragmentShader, gl);
    gl.useProgram(program);

    // Data -------------------------------------------------------------

    const particleData = new Float32Array(NUM_PARTICLES * 4); // x, y, vx, vy

    for (let i = 0; i < NUM_PARTICLES; i++) {
      particleData[i * 4] = randomRange(-1, 1); // x position
      particleData[i * 4 + 1] = randomRange(-1, 1); // y position
      particleData[i * 4 + 2] = randomRange(-0.01, 0.01); // x velocity
      particleData[i * 4 + 3] = randomRange(-0.01, 0.01); // y velocity
    }

    const particleSizes = new Float32Array(NUM_PARTICLES);
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particleSizes[i] = randomRange(1, 5);
    }

    // Texture ----------------------------------------------------------

    let particleTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, particleTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      NUM_PARTICLES,
      1,
      0,
      gl.RGBA,
      gl.FLOAT,
      particleData,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    const sizeTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sizeTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.R32F,
      NUM_PARTICLES,
      1,
      0,
      gl.RED,
      gl.FLOAT,
      particleSizes,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let newParticleTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, newParticleTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32F,
      NUM_PARTICLES,
      1,
      0,
      gl.RGBA,
      gl.FLOAT,
      null,
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Attributes -------------------------------------------------------

    // Uniforms ---------------------------------------------------------
    const uNumParticlesLocation = gl.getUniformLocation(program, 'u_numParticles');
    const uCollisionRadiusLocation = gl.getUniformLocation(
      program,
      'u_collisionRadius',
    );
    const uRepulsionStrengthLocation = gl.getUniformLocation(
      program,
      'u_repulsionStrength',
    );
    const uParticleDataLocation = gl.getUniformLocation(program, 'u_particleData');
    const uParticleSizeLocation = gl.getUniformLocation(program, 'u_particleSize');
    const uDeltaTimeLocation = gl.getUniformLocation(program, 'u_deltaTime');

    gl.uniform1i(uNumParticlesLocation, NUM_PARTICLES);
    gl.uniform1f(uCollisionRadiusLocation, 0.01);
    gl.uniform1f(uRepulsionStrengthLocation, 0.1);

    // Framebuffer ------------------------------------------------------

    // Create a framebuffer and attach the texture
    const particleFBO = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, particleFBO);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      newParticleTexture,
      0,
    );

    // Check if the framebuffer is complete
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      throw new Error('Framebuffer is not complete');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer

    // New program for rendering particles --------------------------------

    // Compile the render shaders and create the render program
    const vertexShaderRender = compileShader(gl.VERTEX_SHADER, vertexRender, gl);
    const fragmentShaderRender = compileShader(
      gl.FRAGMENT_SHADER,
      fragmentRender,
      gl,
    );
    const renderProgram = createProgram(vertexShaderRender, fragmentShaderRender, gl);

    // Set up uniforms for the render shader program
    const uParticleDataLocationRender = gl.getUniformLocation(
      renderProgram,
      'u_particleData',
    );
    const uNumParticlesLocationRender = gl.getUniformLocation(
      renderProgram,
      'u_numParticles',
    );

    // Create an array of particle indices
    const particleIndices = new Float32Array(NUM_PARTICLES);
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particleIndices[i] = i;
    }

    // Create a VAO for particle rendering
    const particleVAO = gl.createVertexArray();
    gl.bindVertexArray(particleVAO);

    const particleIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, particleIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, particleIndices, gl.STATIC_DRAW);

    const aParticleIndexLocation = gl.getAttribLocation(
      renderProgram,
      'a_particleIndex',
    );
    gl.enableVertexAttribArray(aParticleIndexLocation);
    gl.vertexAttribPointer(aParticleIndexLocation, 1, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null); // Unbind the VAO

    // Function to render particles to the screen
    function renderParticles() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(renderProgram);

      // Set uniforms
      gl.uniform1i(uParticleDataLocationRender, 0); // Texture unit 0
      gl.uniform1i(uNumParticlesLocationRender, NUM_PARTICLES);

      // Bind the updated particle data texture
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, particleTexture);

      // Bind the VAO and draw the particles
      gl.bindVertexArray(particleVAO);
      gl.drawArrays(gl.POINTS, 0, NUM_PARTICLES);

      gl.bindVertexArray(null); // Unbind the VAO
    }

    let lastTime = 0;
    const maxDeltaTime = 0.016; // Maximum delta time of ~16ms (60 FPS)

    // Main render function
    const render = (time: number) => {
      let deltaTime = (time - lastTime) * 0.001; // Convert to seconds
      deltaTime = Math.min(deltaTime, maxDeltaTime);
      lastTime = time;

      // First pass: Update particle data
      gl.bindFramebuffer(gl.FRAMEBUFFER, particleFBO);
      gl.viewport(0, 0, NUM_PARTICLES, 1);

      gl.useProgram(program); // Use the update shader program
      gl.uniform1f(uDeltaTimeLocation, deltaTime);

      // Bind textures for the update pass
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, particleTexture);
      gl.uniform1i(uParticleDataLocation, 0);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, sizeTexture);
      gl.uniform1i(uParticleSizeLocation, 1);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Swap particle textures
      const temp = particleTexture;
      particleTexture = newParticleTexture;
      newParticleTexture = temp;

      // Re-attach the new particle texture to the framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, particleFBO);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        newParticleTexture,
        0,
      );

      gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Second pass: Render particles to the screen
      renderParticles();

      // Update any UI elements or counters if needed
      updateCounterElement(counterElement);
    };

    const counterElement = createCounterElement();
    const updateCounterElement = createCounterElementFactory();

    const stop = animationFrameLoop(
      gl,
      (time) => {
        render(time);
        updateCounterElement(counterElement);
      },
      false,
    );

    return () => {
      stop();
      // gl.deleteBuffer(positionBuffer);
      // gl.deleteBuffer(velocityBuffer);
      // gl.deleteBuffer(sizeBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      counterElement.remove();
    };
  }, []);

  return { canvasRef };
};
