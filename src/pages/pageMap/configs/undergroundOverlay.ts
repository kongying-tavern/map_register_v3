export interface UnderGroundOverlayConfig {
  bounds: [[number, number], [number, number]]
  name?: string
  url: string
}

export const undergroundLayerConfigs = readonly({
  /** 须弥 - 诸法丛林 */
  'A:XM:FOREST': [
    { name: '诸法丛林地下-整体', bounds: [[-6299, -2190], [-838, 1906]], url: 'https://v3.yuanshen.site/imgs/sumeru_undergroundmap_shade.png' },
  ],

  /** 须弥 - 大赤沙海 */
  'A:XM:DESERT': [
    { name: '大赤沙海地下-整体', bounds: [[-7664, 542], [-3566, 4640]], url: 'https://v3.yuanshen.site/imgs/固定底图.png' },
  ],

  /** 须弥 - 千壑沙地 */
  'A:XM:DESERT2': [
    { name: '五绿洲', bounds: [[-6171, -730], [-6171 + 643, -730 + 390]] },
    { name: '君王之殿1', bounds: [[-6310, 138], [-6310 + 442, 138 + 409]] },
    { name: '君王之殿2', bounds: [[-6089, 139], [-6089 + 222, 139 + 139]] },
    { name: '君王之殿3', bounds: [[-6368, 145], [-6368 + 435, 145 + 468]] },
    { name: '居尔城墟·赤王神殿1', bounds: [[-7341, 1174], [-7341 + 583, 1174 + 688]] },
    { name: '居尔城墟·赤王神殿2', bounds: [[-6886, 1577], [-6886 + 130, 1577 + 169]] },
    { name: '居尔城墟·赤王神殿3', bounds: [[-7317, 1237], [-7317 + 581, 1237 + 482]] },
    { name: '永恒绿洲', bounds: [[-6793, -125], [-6793 + 698, -125 + 689]] },
    { name: '沙虫隧道1', bounds: [[-5914, -61], [-5914 + 682, -61 + 814]] },
    { name: '沙虫隧道2', bounds: [[-5517, -19], [-5517 + 275, -19 + 506]] },
    { name: '沙虫隧道3', bounds: [[-5490, -25], [-5490 + 180, -25 + 290]] },
    { name: '生命之殿', bounds: [[-7612, 2], [-7612 + 643, 2 + 588]] },
    { name: '行宫花园', bounds: [[-7219, -785], [-7219 + 507, -785 + 522]] },
    { name: '赤王的水晶杯', bounds: [[-7043, -284], [-7043 + 769, -284 + 902]] },
    { name: '酣乐之殿1', bounds: [[-6972, -455], [-6972 + 270, -455 + 354]] },
    { name: '酣乐之殿2', bounds: [[-6882, -548], [-6882 + 505, -548 + 514]] },
    { name: '酣乐之殿3', bounds: [[-6997, -496], [-6997 + 347, -496 + 178]] },
    { name: '酣乐之殿4', bounds: [[-6904, -494], [-6904 + 285, -494 + 279]] },
    { name: '镇灵监牢及巨人峡谷', bounds: [[-7186, 502], [-7186 + 788, 502 + 510]] },
  ].map(({ name, ...rest }) => ({
    ...rest,
    name,
    url: `https://assets.yuanshen.site/overlay/${name}-阴影.png`,
  } as UnderGroundOverlayConfig)),
} as Record<string, UnderGroundOverlayConfig[] | undefined>)
