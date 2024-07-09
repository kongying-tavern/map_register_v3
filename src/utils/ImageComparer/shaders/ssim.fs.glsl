#version 300 es

precision mediump float;

in vec2 v_texCoord;

out vec4 fragColor;

uniform sampler2D u_imageA;
uniform sampler2D u_imageB;

float ssim(vec3 colorA, vec3 colorB) {
  float C1 = 0.01 * 0.01;
  float C2 = 0.03 * 0.03;
  float mean1 = (colorA.r + colorA.g + colorA.b) / 3.0;
  float mean2 = (colorB.r + colorB.g + colorB.b) / 3.0;
  float var1 = ((colorA.r - mean1) * (colorA.r - mean1) + (colorA.g - mean1) * (colorA.g - mean1) + (colorA.b - mean1) * (colorA.b - mean1)) / 3.0;
  float var2 = ((colorB.r - mean2) * (colorB.r - mean2) + (colorB.g - mean2) * (colorB.g - mean2) + (colorB.b - mean2) * (colorB.b - mean2)) / 3.0;
  float covariance = ((colorA.r - mean1) * (colorB.r - mean2) + (colorA.g - mean1) * (colorB.g - mean2) + (colorA.b - mean1) * (colorB.b - mean2)) / 3.0;
  float numerator = (2.0 * mean1 * mean2 + C1) * (2.0 * covariance + C2);
  float denominator = (mean1 * mean1 + mean2 * mean2 + C1) * (var1 + var2 + C2);
  return numerator / denominator;
}

void main(void) {
  vec3 colorA = texture(u_imageA, v_texCoord).rgb;
  vec3 colorB = texture(u_imageB, v_texCoord).rgb;
  fragColor = vec4(vec3(ssim(colorA, colorB)), 1.0);
}
