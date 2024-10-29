import { useEffect } from 'react';
import {
  compileShader,
  createProgram,
  createFpsCounter,
  frameFactory,
  getGlContextFromCanvas,
  readBufferFromGPU,
} from 'webgl/utils';

import vertexSource from './shaders/vertex-shader.glsl?raw';
import fragmentSource from './shaders/fragment-shader.glsl?raw';

export const useParticleSystem = () => {
  useEffect(() => {
    const gl = getGlContextFromCanvas();
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    gl.transformFeedbackVaryings(program, ['v_output1', 'v_output2'], gl.INTERLEAVED_ATTRIBS);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(`Could not link WebGL program.\n\n${info}`);
    }

    gl.useProgram(program);

    const COUNT = 1000;

    const buffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer1);
    gl.bufferData(gl.ARRAY_BUFFER, COUNT * 4 * 2, gl.DYNAMIC_READ);

    // const buffer2 = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, buffer2);
    // gl.bufferData(gl.ARRAY_BUFFER, COUNT * 4, gl.DYNAMIC_READ);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.enable(gl.RASTERIZER_DISCARD);

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer1);
    // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, buffer2);

    gl.beginTransformFeedback(gl.POINTS);
    gl.drawArrays(gl.POINTS, 0, COUNT);
    gl.endTransformFeedback();

    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, null);
    // gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, null);

    gl.disable(gl.RASTERIZER_DISCARD);

    readBufferFromGPU(gl, buffer1, COUNT, console.log);

    // gl.clearColor(0, 0, 0, 1);
    // const draw = () => {
    //   gl.clear(gl.COLOR_BUFFER_BIT);
    //   gl.bindVertexArray(vao);
    //   gl.drawArrays(gl.TRIANGLES, 0, 3);
    //   gl.bindVertexArray(null);
    // };
    // const updateCounter = createFpsCounter();
    // const { start, stop } = frameFactory(() => {
    //   draw();
    //   updateCounter();
    // });
    // start();

    return () => {
      // stop();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);
};
