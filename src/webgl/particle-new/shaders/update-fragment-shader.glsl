#version 300 es
precision highp float;

uniform sampler2D u_positionVelocityTexture;
uniform sampler2D u_particleSizeTexture;
uniform float u_deltaTime;
uniform float u_particleCount;

out vec4 outPositionVelocity;

void main() {
  int index = int(gl_FragCoord.x);
  if(index >= int(u_particleCount)) {
    discard; // Ensure we don't process pixels outside the particle count
  }

  // Fetch position, velocity, and size
  vec4 positionVelocity = texelFetch(u_positionVelocityTexture, ivec2(index, 0), 0);
  vec4 particleSize = texelFetch(u_particleSizeTexture, ivec2(index, 0), 0);

  // Unpack position and velocity
  vec2 position = positionVelocity.xy;
  vec2 velocity = positionVelocity.zw;

  // Compute the new position and velocity
  vec2 newPosition = position + velocity * u_deltaTime;
  vec2 newVelocity = velocity;

  // Boundary limits adjusted for point size
  float minX = -1.0f + particleSize.y;
  float maxX = 1.0f - particleSize.y;
  float minY = -1.0f + particleSize.z;
  float maxY = 1.0f - particleSize.z;

  // Boundary x-axis reflection
  if(newPosition.x <= minX || newPosition.x >= maxX) {
    newPosition.x = clamp(newPosition.x, minX, maxX);
    newVelocity.x = -newVelocity.x;
  }
  // Boundary y-axis reflection
  if(newPosition.y <= minY || newPosition.y >= maxY) {
    newPosition.y = clamp(newPosition.y, minY, maxY);
    newVelocity.y = -newVelocity.y;
  }

  // Output the new position and velocity
  outPositionVelocity = vec4(newPosition, newVelocity);
}