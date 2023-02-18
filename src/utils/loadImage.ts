export interface LoadImageOptions {
  crossOrigin?: 'anonymous' | 'use-credentials' | ''
  referrerPolicy?: 'origin' | 'no-referrer' | 'unsafe-url' | ''
}

/** 以内存模式加载图片 */
export const loadImage = (src: string, options: LoadImageOptions = {}) => new Promise<HTMLImageElement>((resolve, reject) => {
  const { referrerPolicy = 'no-referrer', crossOrigin = '' } = options
  const img = new Image()
  img.crossOrigin = crossOrigin
  img.referrerPolicy = referrerPolicy
  img.src = src
  img.onload = () => {
    resolve(img)
  }
  img.onerror = () => {
    reject(new Error('图片加载错误'))
  }
})
