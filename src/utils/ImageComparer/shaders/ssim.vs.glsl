#version 300 es

precision mediump float;

in vec4 instancePosition;
in vec2 instanceTexCoord;

out vec2 v_texCoord;

void main(void) {
  gl_Position = instancePosition;
  v_texCoord = instanceTexCoord;
}
