import { useEffect, useRef } from 'react';
import { compileShader, createProgram, initGlFromRef, randomRange } from 'webgl/utils';

import updateVertexSource from './shaders/update-vertex-shader.glsl?raw';
import updateFragmentSource from './shaders/update-fragment-shader.glsl?raw';
import drawVertexSource from './shaders/draw-vertex-shader.glsl?raw';
import drawFragmentSource from './shaders/draw-fragment-shader.glsl?raw';

const SPEED = 0.1;
const PARTICLE_COUNT = 400;

const createParticleData = (particleCount: number) => {
  const particleData = new Float32Array(particleCount * 4); // x, y, vx, vy
  for (let i = 0; i < particleCount; i++) {
    particleData[i * 4] = randomRange(-1, 1); // x position
    particleData[i * 4 + 1] = randomRange(-1, 1); // y position
    const direction = Math.floor(Math.random() * 360 + 1);
    particleData[i * 4 + 2] = Math.cos(direction) * SPEED; // x velocity
    particleData[i * 4 + 3] = Math.sin(direction) * SPEED; // y velocity
  }
  return particleData;
};

const createParticleSizeData = (
  particleCount: number,
  screenWidth: number,
  screenHeight: number,
) => {
  const particleSizeData = new Float32Array(particleCount * 4); // size, halfSize
  for (let i = 0; i < particleCount; i++) {
    // const size = randomRange(0.01, 0.05);
    const size = 20;
    particleSizeData[i * 4] = size;
    particleSizeData[i * 4 + 1] = (size / 2 / screenWidth) * 2; // halfSize in NDC space (0 to 2) for x
    particleSizeData[i * 4 + 2] = (size / 2 / screenHeight) * 2; // halfSize in NDC space (0 to 2) for y
    particleSizeData[i * 4 + 3] = 0;
  }
  return particleSizeData;
};

const createTexture = (gl: WebGL2RenderingContext, srcData: Float32Array) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA32F,
    PARTICLE_COUNT,
    1,
    0,
    gl.RGBA,
    gl.FLOAT,
    srcData,
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  return texture;
};

const createFramebuffer = (gl: WebGL2RenderingContext, texture: WebGLTexture | null) => {
  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE)
    throw new Error('Framebuffer is not complete');
  gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer
  return framebuffer;
};

const createVertexArray = (gl: WebGL2RenderingContext) => {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  // No vertex attributes to set up
  gl.bindVertexArray(null);

  // Ensure no vertex attributes are enabled
  gl.bindVertexArray(null);
  for (let i = 0; i < gl.getParameter(gl.MAX_VERTEX_ATTRIBS); ++i) {
    gl.disableVertexAttribArray(i);
  }
  return vao;
};

export const useParticleNew = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { gl } = initGlFromRef(canvasRef);

    console.log('NDC: ', gl.canvas.width, gl.canvas.height);

    const extColorBufferFloat = gl.getExtension('EXT_color_buffer_float');
    if (!extColorBufferFloat) throw new Error('EXT_color_buffer_float not supported');

    // Shaders and programs -----------------------------------------------

    const updateVertexShader = compileShader(updateVertexSource, gl.VERTEX_SHADER, gl);
    const updateFragmentShader = compileShader(updateFragmentSource, gl.FRAGMENT_SHADER, gl);
    const updateProgram = createProgram(updateVertexShader, updateFragmentShader, gl);

    const renderVertexShader = compileShader(drawVertexSource, gl.VERTEX_SHADER, gl);
    const renderFragmentShader = compileShader(drawFragmentSource, gl.FRAGMENT_SHADER, gl);
    const drawProgram = createProgram(renderVertexShader, renderFragmentShader, gl);

    // Particle data ------------------------------------------------------
    const particleData = createParticleData(PARTICLE_COUNT);
    const particleSizeData = createParticleSizeData(
      PARTICLE_COUNT,
      gl.canvas.width,
      gl.canvas.height,
    );

    // Textures -----------------------------------------------------------
    // Create texture to store position and velocity
    let positionVelocityTexture = createTexture(gl, particleData);
    // Create texture to store new position and velocity
    let newPositionVelocityTexture = createTexture(gl, particleData);
    // Create texture to store particle size
    const particleSizeTexture = createTexture(gl, particleSizeData);

    // Framebuffer --------------------------------------------------------
    const framebuffer = createFramebuffer(gl, newPositionVelocityTexture);

    // VAO ----------------------------------------------------------------
    const vao = createVertexArray(gl);

    // Uniforms -----------------------------------------------------------
    // Get uniform locations from update program
    const uDeltaTimeLoc = gl.getUniformLocation(updateProgram, 'u_deltaTime');
    const uParticleCountLocUpdate = gl.getUniformLocation(updateProgram, 'u_particleCount');
    const uPositionVelocityTextureLocUpdate = gl.getUniformLocation(
      updateProgram,
      'u_positionVelocityTexture',
    );
    const uParticleSizeTextureLoc = gl.getUniformLocation(
      updateProgram,
      'u_particleSizeTexture',
    );
    // Get uniform locations from draw program
    const uPositionVelocityTextureLocDraw = gl.getUniformLocation(
      drawProgram,
      'u_positionVelocityTexture',
    );

    // Main loop ------------------------------------------------------------

    const updatePoints = (deltaTime: number) => {
      // Bind the framebuffer to render to the texture
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      // Attach the newPositionVelocityTexture to the framebuffer
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        newPositionVelocityTexture,
        0,
      );

      // Set viewport to match the texture size
      gl.viewport(0, 0, PARTICLE_COUNT, 1);

      // Use the position update program and bind the VAO
      gl.useProgram(updateProgram);
      gl.bindVertexArray(vao);

      // Set uniforms
      gl.uniform1f(uDeltaTimeLoc, deltaTime);
      gl.uniform1f(uParticleCountLocUpdate, PARTICLE_COUNT);

      // Bind the input texture (positionVelocityTexture) to texture unit 0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, positionVelocityTexture);
      gl.uniform1i(uPositionVelocityTextureLocUpdate, 0); // Texture unit 0

      // Bind the particle size texture to texture unit 1
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, particleSizeTexture);
      gl.uniform1i(uParticleSizeTextureLoc, 1); // Texture unit 1

      // Draw updated positions to the framebuffer
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // Swap the textures: the updated data becomes the current data
      [positionVelocityTexture, newPositionVelocityTexture] = [
        newPositionVelocityTexture,
        positionVelocityTexture,
      ];
    };

    const drawPoints = () => {
      // Unbind the framebuffer to render to the canvas
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      // Set viewport to canvas size
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

      // Clear the canvas
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Use the render program
      gl.useProgram(drawProgram);
      gl.bindVertexArray(vao);

      // Set uniforms
      gl.uniform1i(uPositionVelocityTextureLocDraw, 0); // Texture unit 0

      // Bind the updated texture (positionVelocityTexture) to texture unit 0
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, positionVelocityTexture);

      // Draw the particles to the canvas
      gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);
    };

    const tickFactory = () => {
      let lastTime = 0;
      let raf: number;
      const maxDeltaTime = 0.016; // Maximum delta time of ~16ms (60 FPS)

      const tick = (time = 0) => {
        let deltaTime = (time - lastTime) * 0.001;
        deltaTime = Math.min(deltaTime, maxDeltaTime);
        lastTime = time;

        updatePoints(deltaTime);
        drawPoints();

        raf = requestAnimationFrame(tick);
        return () => {
          cancelAnimationFrame(raf);
        };
      };

      return tick;
    };

    const stop = tickFactory()();

    return () => {
      stop();
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(drawProgram);
      gl.deleteTexture(positionVelocityTexture);
      gl.deleteTexture(newPositionVelocityTexture);
      gl.deleteFramebuffer(framebuffer);
      gl.deleteVertexArray(vao);
      gl.deleteShader(updateVertexShader);
      gl.deleteShader(updateFragmentShader);
      gl.deleteShader(renderVertexShader);
      gl.deleteShader(renderFragmentShader);
    };
  }, []);

  return { canvasRef };
};
