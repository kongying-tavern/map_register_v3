#version 300 es
#define SHADER_NAME icon-layer-fragment-shader

precision highp float;

uniform sampler2D iconsTexture;

in float vColorMode;
in vec4 vColor;
in vec2 vTextureCoords;
in vec2 uv;
in vec3 vAttachCoords[5];

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  vec4 texColor = texture(iconsTexture, vTextureCoords);

  for (int i = 0; i < vAttachCoords.length(); ++i) {
    vec3 info = vAttachCoords[i];
    vec4 px = texture(iconsTexture, info.xy);
    texColor = mix(texColor, px, min(info.z, px.a));
  }

  // if colorMode == 0, use pixel color from the texture
  // if colorMode == 1 or rendering picking buffer, use texture as transparency mask
  vec3 color = mix(texColor.rgb, vColor.rgb, vColorMode);

  // Take the global opacity and the alpha from vColor into account for the alpha component
  float a = texColor.a * layer.opacity * vColor.a;

  if (a < icon.alphaCutoff) {
    discard;
  }

  fragColor = vec4(color, a);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}

