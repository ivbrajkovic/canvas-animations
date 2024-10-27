#version 300 es
precision mediump float;

// Supplied vertex position attribute
in vec3 a_position;

void main(void) {
  // Set the position in clipspace coordinates
  gl_Position = vec4(a_position, 1.0f);
}