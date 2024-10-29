#version 300 es

in float a_input1;
in float a_input2;

out float v_output1;
out float v_output2;

void main() {
  v_output1 = a_input1 + .1f;
  v_output2 = a_input2 + .2f;
  // v_output2 = float(gl_VertexID);
}