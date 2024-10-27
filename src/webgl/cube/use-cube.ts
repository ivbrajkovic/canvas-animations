import { useEffect, useRef } from 'react';
import { compileShader, createProgram } from 'webgl/utils';

import vertexSource from './vertex-shader.glsl?raw';
import fragmentSource from './fragment-shader.glsl?raw';

const initGl = (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) => {
  const canvas = canvasRef.current;
  if (!canvas) throw new Error('Failed to get canvas element');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gl = canvas.getContext('webgl2');
  if (!gl) throw new Error('Failed to get WebGL context');

  return { canvas, gl };
};

export const useCube = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const { gl } = initGl(canvasRef);

    const vertexShader = compileShader(vertexSource, gl.VERTEX_SHADER, gl);
    const fragmentShader = compileShader(fragmentSource, gl.FRAGMENT_SHADER, gl);
    const program = createProgram([vertexShader, fragmentShader], gl);
    gl.useProgram(program);

    // prettier-ignore
    const positions = new Float32Array([
     -0.5, 0.5, 0,
      -0.5, -0.5, 0,
      0.5, -0.5, 0,
      0.5, 0.5, 0,
    ]);

    // prettier-ignore
    const indices = new Uint16Array([
      0, 1, 2,
      0, 2, 3,
    ]);

    // Setting up the VBO
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    // Setting up the IBO
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // Clean
    // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    const draw = () => {
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    };

    draw();

    return () => {
      gl.deleteBuffer(indexBuffer);
      gl.deleteBuffer(positionBuffer);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteProgram(program);
    };
  }, []);

  return { canvasRef };
};
