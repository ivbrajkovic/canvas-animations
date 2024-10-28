#version 300 es
precision highp float;

uniform sampler2D u_positionVelocityTexture;

void main() {
  int index = gl_VertexID;
  vec4 positionVelocity = texelFetch(u_positionVelocityTexture, ivec2(index, 0), 0);

  vec2 a_position = positionVelocity.xy;

  gl_Position = vec4(a_position, 0.0f, 1.0f);
  gl_PointSize = 20.0f;
}
