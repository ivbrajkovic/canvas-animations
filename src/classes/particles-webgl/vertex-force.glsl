#version 300 es
precision highp float;

out vec2 v_texCoord; // Texture coordinates for the fragment shader

void main() {
    // Define positions for a full-screen quad (two triangles)
  vec2 positions[6] = vec2[](vec2(-1.0f, -1.0f), vec2(1.0f, -1.0f), vec2(-1.0f, 1.0f), vec2(-1.0f, 1.0f), vec2(1.0f, -1.0f), vec2(1.0f, 1.0f));
  vec2 texCoords[6] = vec2[](vec2(0.0f, 0.0f), vec2(1.0f, 0.0f), vec2(0.0f, 1.0f), vec2(0.0f, 1.0f), vec2(1.0f, 0.0f), vec2(1.0f, 1.0f));

  gl_Position = vec4(positions[gl_VertexID], 0.0f, 1.0f);
  v_texCoord = texCoords[gl_VertexID];
}