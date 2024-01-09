import { MAP_FONTFAMILY } from '@/pages/pageMapV2/shared'
import genshinFont from '@/style/fonts/genshinFont.woff2?url'

interface ChromeFontFaceSet extends FontFaceSet {
  add: Set<FontFace>['add']
  has: Set<FontFace>['has']
}

export const loadFonts = async () => {
  const fonts = document.fonts as unknown as ChromeFontFaceSet
  const gsFont = new FontFace(MAP_FONTFAMILY, `url(${genshinFont})`)
  await gsFont.load()
  fonts.add(gsFont)
}
