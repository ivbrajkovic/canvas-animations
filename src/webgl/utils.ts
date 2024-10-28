export const compileShader = (
  source: string,
  type: number,
  gl: WebGLRenderingContext,
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
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
  gl: WebGLRenderingContext,
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create WebGL program');

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

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

export const randomRange = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};
