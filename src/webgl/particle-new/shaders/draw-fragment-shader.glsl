#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  // Calculate the distance from the center of the point
  vec2 coord = 2.0f * gl_PointCoord - 1.0f;  // gl_PointCoord gives the coordinates within the point (0.0 to 1.0)
  float dist = dot(coord, coord);

  // If the distance from the center is greater than 1.0, discard the fragment (make it transparent)
  if(dist > 1.0f)
    discard;

  fragColor = vec4(1, 1, 1, 1);
}
