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
  shaders: WebGLShader[],
  gl: WebGLRenderingContext,
): WebGLProgram => {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create WebGL program');

  shaders.forEach((shader) => gl.attachShader(program, shader));

  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Could not link WebGL program.\n\n${info}`);
  }
  return program;
};
