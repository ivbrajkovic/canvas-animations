#version 300 es

in vec3 a_position;

void main() {
  gl_Position = vec4(a_position, 1.0f);
}