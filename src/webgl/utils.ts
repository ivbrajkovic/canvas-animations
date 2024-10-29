export const randomRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

export const compileShader = (
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader => {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed.\n\n${info}`);
  }
  return shader;
};

export const createProgram = (
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create WebGL program');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  const shaders = gl.getAttachedShaders(program);
  if (shaders?.length !== 2) {
    gl.deleteProgram(program);
    throw new Error('Failed to attach shaders to WebGL program');
  }

  return program;
};

export const linkProgram = (gl: WebGL2RenderingContext, program: WebGLProgram) => {
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Could not link WebGL program.\n\n${info}`);
  }
  return program;
};

export const initGlFromRef = (
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
) => {
  const canvas = canvasRef.current;
  if (!canvas) throw new Error('Failed to get canvas element');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('Failed to get WebGL context');

  return { canvas, gl };
};

export const getGlContextFromCanvas = (
  elementId = 'canvas',
  width = window.innerWidth,
  height = window.innerHeight,
) => {
  const canvas = document.getElementById(elementId) as HTMLCanvasElement;
  if (!canvas) throw new Error('Failed to get canvas element');

  canvas.width = width;
  canvas.height = height;

  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('Failed to get WebGL context');

  return gl;
};

export const frameFactory = (callback: (deltaTime: number) => void, maxDeltaTime = 0.016) => {
  let lastTime = 0;
  let raf: number;

  const frame = (time = 0) => {
    let deltaTime = (time - lastTime) * 0.001;
    deltaTime = Math.min(deltaTime, maxDeltaTime); // Maximum delta time of ~16ms (60 FPS)
    lastTime = time;

    callback(deltaTime);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
  };

  return { start, stop };
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

export const createFpsCounter = (element?: HTMLElement) => {
  element ??= createCounterElement();

  let frameCount = 0,
    previousFpsTime = performance.now();

  const updateCounter = (interval = 1000) => {
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

  return updateCounter;
};

export const readBufferFromGPU = (
  gl: WebGL2RenderingContext,
  buffer: WebGLBuffer | null,
  count: number,
  callback: (error: Error | null, view: Float32Array | null) => void,
  target = gl.ARRAY_BUFFER,
) => {
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  if (!sync) {
    callback(new Error('[GPU] Failed to create sync object'), null);
    return;
  }

  const checkStatus = () => {
    const statue = gl.clientWaitSync(sync, gl.SYNC_FLUSH_COMMANDS_BIT, 0);
    if (statue === gl.TIMEOUT_EXPIRED) {
      console.log('[GPU] Still processing...');
      setTimeout(checkStatus);
    } else if (statue === gl.WAIT_FAILED) {
      callback(new Error('[GPU] Failed to wait for sync object'), null);
    } else {
      const view = new Float32Array(count);
      gl.bindBuffer(target, buffer);
      gl.getBufferSubData(target, 0, view);
      gl.bindBuffer(target, null);
      callback(null, view);
    }
  };

  setTimeout(checkStatus);
};
