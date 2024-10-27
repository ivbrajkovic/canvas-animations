#version 300 es

in vec2 a_position;
in vec2 a_velocity;
in float a_size;
uniform float u_time;
uniform float u_speed;

void main() {
  vec2 new_position = a_position + a_velocity * u_time * u_speed;
  new_position.x = mod(new_position.x + 1.0f, 2.0f) - 1.0f;
  new_position.y = mod(new_position.y + 1.0f, 2.0f) - 1.0f;

  gl_PointSize = a_size;
  gl_Position = vec4(new_position, 0.0f, 1.0f);
}