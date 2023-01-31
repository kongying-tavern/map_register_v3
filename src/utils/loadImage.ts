export interface LoadImageOptions {
  referrerPolicy?: 'origin' | 'no-referrer' | 'unsafe-url' | ''
}

/** 以内存模式加载图片 */
export const loadImage = (src: string, options: LoadImageOptions = {}) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const { referrerPolicy = '' } = options
    const img = new Image()
    img.referrerPolicy = referrerPolicy
    img.src = src
    img.onload = () => {
      resolve(img)
    }
    img.onerror = () => {
      reject(new Error('图片加载错误'))
    }
  })
}
