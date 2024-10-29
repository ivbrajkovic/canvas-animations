import { useEffect } from 'react';
import {
  compileShader,
  createProgram,
  createFpsCounter,
  frameFactory,
  getGlContextFromCanvas,
} from 'webgl/utils';

import vertexSource from './shaders/vertex-shader.glsl?raw';
import fragmentSource from './shaders/fragment-shader.glsl?raw';

export const useHelloWorld = () => {
  useEffect(() => {
    const gl = getGlContextFromCanvas();
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = createProgram(gl, vertexShader, fragmentShader);

    // prettier-ignore
    const data = new Float32Array([
      -0.5, -0.5, 0.0,
       0.5, -0.5, 0.0,
       0.0,  0.5, 0.0,
    ]);

    gl.linkProgram(program);
    gl.useProgram(program);

    const position = gl.getAttribLocation(program, 'a_position');

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(position);

    gl.bindVertexArray(null);

    gl.clearColor(0, 0, 0, 1);

    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const updateCounter = createFpsCounter();
    const { start, stop } = frameFactory(() => {
      draw();
      updateCounter();
    });
    start();

    return () => {
      stop();
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
    };
  }, []);
};
