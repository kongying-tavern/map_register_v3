import { IconLayer } from '@deck.gl/layers'
import fs from './shaders/marker-sub-layer.fs.glsl?raw'

export interface MarkerSubLayerProps {
  getIconFlag: (id: number) => number
}

/**
 * 可用于附加渲染的子纹理总数。
 * 该值为 `src\stores\hooks\useMarkerSprite.ts` 中定义的状态数以及
 * `src\worker\markerSpriteRenderer\renderer.worker.ts` 中定义的附加纹理数
 * 的总和
 */
const ATTACH_TOTAL = 5

export class MarkerSubLayer extends IconLayer<number, MarkerSubLayerProps> {
  static layerName = 'MarkerLayer'

  static defaultProps = Object.assign({
    getIconFlag: { type: 'accessor', value: 0 },
  }, IconLayer.defaultProps)

  declare state: IconLayer['state'] & {
    finished?: boolean
  }

  initializeState = () => {
    super.initializeState()

    const attributeManager = this.getAttributeManager()!

    attributeManager.addInstanced({
      instanceAttachFlags: {
        size: 1,
        type: 'uint16',
        accessor: 'getIconFlag',
        defaultValue: 0,
      },
    })
  }

  getShaders = () => {
    const shader = {
      ...super.getShaders(),
      fs,
      inject: {
        'vs:#decl': /* glsl */`
          in uint instanceAttachFlags;
          out vec3 vAttachCoords[${ATTACH_TOTAL}];
        `,
        'vs:#main-end': /* glsl */`
          for (int i = 0; i < 5; ++i) {
            float alpha = float((instanceAttachFlags >> i) & 1u);
            float x = float(i) * iconSize.x;
            vec2 rawCoord = vec2(x, 0.0);
            vec2 coord = mix(
              rawCoord,
              rawCoord + iconSize,
              (positions.xy + 1.0) / 2.0
            ) / iconsTextureDim;
            vAttachCoords[i] = vec3(coord, alpha);
          }
        `,
      },
    }
    return shader
  }
}
