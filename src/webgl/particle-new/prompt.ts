const positionUpdateVertexShaderSource = `#version 300 es
precision highp float;

uniform sampler2D u_positionVelocityTexture;
uniform float u_deltaTime;
uniform float u_particleCount;

out vec2 v_currentPosition;
out vec2 v_currentVelocity;

void main() {
  int index = gl_VertexID;
  vec4 positionVelocity = texelFetch(u_positionVelocityTexture, ivec2(index, 0), 0);

  vec2 a_position = positionVelocity.xy;
  vec2 a_velocity = positionVelocity.zw;

  // Compute the new position and velocity
  vec2 newPosition = a_position + a_velocity * u_deltaTime;
  vec2 newVelocity = a_velocity;

  // Boundary checks
  if(newPosition.x < -1.0f || newPosition.x > 1.0f) {
    newPosition.x = clamp(newPosition.x, -1.0f, 1.0f);
    newVelocity.x = -newVelocity.x;
  }
  if(newPosition.y < -1.0f || newPosition.y > 1.0f) {
    newPosition.y = clamp(newPosition.y, -1.0f, 1.0f);
    newVelocity.y = -newVelocity.y;
  }

  v_currentPosition = newPosition;
  v_currentVelocity = newVelocity;

  // Map the particle index to a position in NDC space
  float x = (float(index) + 0.5f) / u_particleCount * 2.0f - 1.0f;
  gl_Position = vec4(x, 0.0f, 0.0f, 1.0f);
}
`;
const positionUpdateFragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_currentPosition;
in vec2 v_currentVelocity;
out vec4 outPositionVelocity;

void main() {
  outPositionVelocity = vec4(v_currentPosition, v_currentVelocity);
}
`;
const renderVertexShaderSource = `#version 300 es
precision highp float;

uniform sampler2D u_positionVelocityTexture;

void main() {
  int index = gl_VertexID;
  vec4 positionVelocity = texelFetch(u_positionVelocityTexture, ivec2(index, 0), 0);

  vec2 a_position = positionVelocity.xy;

  gl_Position = vec4(a_position, 0.0f, 1.0f);
  gl_PointSize = 20.0f;

`;
const renderFragmentShaderSource = `#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1, 0, 0, 1);
}
`;

const PARTICLE_COUNT = 10;

const { gl } = initGlFromRef(canvasRef);

const extColorBufferFloat = gl.getExtension('EXT_color_buffer_float');
if (!extColorBufferFloat) {
  throw new Error('EXT_color_buffer_float not supported');
}

// Shaders and programs ---------------------------------------------------

const positionUpdateVertexShader = compileShader(
  positionUpdateVertexShaderSource,
  gl.VERTEX_SHADER,
  gl,
);
const positionUpdateFragmentShader = compileShader(
  positionUpdateFragmentShaderSource,
  gl.FRAGMENT_SHADER,
  gl,
);
const positionUpdateProgram = createProgram(
  positionUpdateVertexShader,
  positionUpdateFragmentShader,
  gl,
);

const renderVertexShader = compileShader(renderVertexShaderSource, gl.VERTEX_SHADER, gl);
const renderFragmentShader = compileShader(
  renderFragmentShaderSource,
  gl.FRAGMENT_SHADER,
  gl,
);
const renderProgram = createProgram(renderVertexShader, renderFragmentShader, gl);

// Position and velocity data ----------------------------------------------

const particleData = new Float32Array(PARTICLE_COUNT * 4); // x, y, vx, vy
for (let i = 0; i < PARTICLE_COUNT; i++) {
  particleData[i * 4] = randomRange(-1, 1); // x position
  particleData[i * 4 + 1] = randomRange(-1, 1); // y position
  particleData[i * 4 + 2] = randomRange(-0.01, 0.01); // x velocity
  particleData[i * 4 + 3] = randomRange(-0.01, 0.01); // y velocity
}

// Textures -----------------------------------------------------------

// Create texture to store position and velocity
let positionVelocityTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, positionVelocityTexture);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA32F,
  PARTICLE_COUNT,
  1,
  0,
  gl.RGBA,
  gl.FLOAT,
  particleData,
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// Create texture to store new position and velocity
let newPositionVelocityTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, newPositionVelocityTexture);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA32F,
  PARTICLE_COUNT,
  1,
  0,
  gl.RGBA,
  gl.FLOAT,
  particleData,
);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// Framebuffer -----------------------------------------------------------

// Create framebuffer and attach the texture
const framebuffer = gl.createFramebuffer();
gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
gl.framebufferTexture2D(
  gl.FRAMEBUFFER,
  gl.COLOR_ATTACHMENT0,
  gl.TEXTURE_2D,
  newPositionVelocityTexture, // Do we need to attach the texture?
  0,
);
if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
  throw new Error('Framebuffer is not complete');
}
gl.bindFramebuffer(gl.FRAMEBUFFER, null); // Unbind the framebuffer

// Create and bind VAOs
const updateVAO = gl.createVertexArray();
gl.bindVertexArray(updateVAO);
// No vertex attributes to set up
gl.bindVertexArray(null);

const renderVAO = gl.createVertexArray();
gl.bindVertexArray(renderVAO);
// No vertex attributes to set up
gl.bindVertexArray(null);

// Ensure no vertex attributes are enabled
gl.bindVertexArray(null);
for (let i = 0; i < gl.getParameter(gl.MAX_VERTEX_ATTRIBS); ++i) {
  gl.disableVertexAttribArray(i);
}

// Get uniform locations
const uDeltaTimeLoc = gl.getUniformLocation(positionUpdateProgram, 'u_deltaTime');
const uPositionVelocityTextureLocUpdate = gl.getUniformLocation(
  positionUpdateProgram,
  'u_positionVelocityTexture',
);
const uParticleCountLocUpdate = gl.getUniformLocation(
  positionUpdateProgram,
  'u_particleCount',
);

const uPositionVelocityTextureLocRender = gl.getUniformLocation(
  renderProgram,
  'u_positionVelocityTexture',
);
const uParticleCountLocRender = gl.getUniformLocation(renderProgram, 'u_particleCount');

const renderPoints = (deltaTime: number) => {
  // **Position Update Pass**

  // Bind the framebuffer to render to the texture
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);

  // Attach the newPositionVelocityTexture to the framebuffer
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    newPositionVelocityTexture,
    0,
  );

  // Set viewport to match the texture size
  gl.viewport(0, 0, PARTICLE_COUNT, 1);

  // Clear the framebuffer (optional but good practice)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use the position update program
  gl.useProgram(positionUpdateProgram);
  gl.bindVertexArray(updateVAO);

  // Set uniforms
  gl.uniform1i(uPositionVelocityTextureLocUpdate, 0); // Texture unit 0
  gl.uniform1f(uDeltaTimeLoc, deltaTime);
  gl.uniform1f(uParticleCountLocUpdate, PARTICLE_COUNT);

  // Bind the input texture (positionVelocityTexture) to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, positionVelocityTexture);

  // Draw PARTICLE_COUNT points to update positions
  gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

  // Unbind the VAO
  gl.bindVertexArray(null);

  // Swap the textures: the updated data becomes the current data
  const temp = positionVelocityTexture;
  positionVelocityTexture = newPositionVelocityTexture;
  newPositionVelocityTexture = temp;

  // **Render Pass**

  // Unbind the framebuffer to render to the canvas
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  // Set viewport to canvas size
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Use the render program
  gl.useProgram(renderProgram);
  gl.bindVertexArray(renderVAO);

  // Set uniforms
  gl.uniform1i(uPositionVelocityTextureLocRender, 0); // Texture unit 0

  // Bind the updated texture (positionVelocityTexture) to texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, positionVelocityTexture);

  // Draw the particles
  gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

  // Unbind the VAO
  gl.bindVertexArray(null);
};

let lastTime = 0;
let raf: number;
const maxDeltaTime = 0.016; // Maximum delta time of ~16ms (60 FPS)

const draw = (time = 0) => {
  let deltaTime = (time - lastTime) * 0.001;
  deltaTime = Math.min(deltaTime, maxDeltaTime);
  lastTime = time;

  renderPoints(deltaTime);

  raf = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(raf);
  };
};

draw();

// pretend all missing variable and function are declared, this code draw a point on the screen but point doesnt move, check the code, fix it with explanation, propose improvements
