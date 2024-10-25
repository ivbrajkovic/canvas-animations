#version 300 es
precision mediump float;

uniform int u_numParticles;
uniform sampler2D u_particleData;
uniform sampler2D u_particleSize;
uniform float u_collisionRadius;
uniform float u_repulsionStrength;
uniform float u_deltaTime;

in vec2 v_texCoord;
out vec4 outColor;

void main() {
  int particleIndex = int(v_texCoord.x * float(u_numParticles));
  vec4 particle = texelFetch(u_particleData, ivec2(particleIndex, 0), 0);
  vec2 position = particle.xy;
  vec2 velocity = particle.zw;

  vec2 force = vec2(0.0f);

  for(int i = 0; i < u_numParticles; i++) {
    if(i == particleIndex)
      continue;
    vec4 otherParticle = texelFetch(u_particleData, ivec2(i, 0), 0);
    vec2 otherPosition = otherParticle.xy;

    vec2 direction = position - otherPosition;
    float distance = length(direction);

    if(distance < u_collisionRadius) {
      force += normalize(direction) * u_repulsionStrength / (distance + 0.01f);
    }
  }

    // Update velocity and position
  velocity += force * u_deltaTime;
  position += velocity * u_deltaTime;

    // Clamp velocity magnitude to prevent excessive speeds
  float maxSpeed = 1.0f; // Adjust as needed
  float speed = length(velocity);
  if(speed > maxSpeed) {
    velocity = (velocity / speed) * maxSpeed;
  }

    // Boundary checks with position reflection
  float epsilon = 0.0001f;
  float minX = -1.0f + epsilon;
  float maxX = 1.0f - epsilon;
  float minY = -1.0f + epsilon;
  float maxY = 1.0f - epsilon;

  if(position.x > maxX) {
    position.x = maxX - (position.x - maxX);
    velocity.x = -abs(velocity.x);
  } else if(position.x < minX) {
    position.x = minX - (minX - position.x);
    velocity.x = abs(velocity.x);
  }

  if(position.y > maxY) {
    position.y = maxY - (position.y - maxY);
    velocity.y = -abs(velocity.y);
  } else if(position.y < minY) {
    position.y = minY - (minY - position.y);
    velocity.y = abs(velocity.y);
  }

  outColor = vec4(position, velocity);
}
