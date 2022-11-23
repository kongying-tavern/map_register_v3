export const getObjectFitSize = (
  type: 'cover' | 'contain',
  containerWidth: number,
  containerHeight: number,
  imgWidth: number,
  imgHeight: number,
) => {
  let radio = 1 // 容器与图片的比例
  let sx = 0 // 开始剪切的 x 坐标位置。
  let sy = 0 // 开始剪切的 y 坐标位置。
  let swidth = imgWidth // 被剪切图像的宽度。
  let sheight = imgHeight // 被剪切图像的高度。
  let x = 0 // 在画布上放置图像的 x 坐标位置。
  let y = 0 // 在画布上放置图像的 y 坐标位置。
  let width = containerWidth // 要使用的图像的宽度（伸展或缩小图像）。
  let height = containerHeight // 要使用的图像的高度（伸展或缩小图像）。
  const cWHRatio = containerWidth / containerHeight
  const iWHRatio = imgWidth / imgHeight
  if (type === 'cover') {
    // cover模式，需要裁剪
    if (iWHRatio >= cWHRatio) {
      // 横图，高先匹配，裁剪宽度
      radio = containerHeight / imgHeight
      sx = (imgWidth - containerWidth / radio) / 2
      swidth = containerWidth / radio
      sheight = imgHeight
    }
    else {
      // 竖图，宽先匹配，裁剪高度
      radio = containerWidth / imgWidth
      sy = (imgHeight - containerHeight / radio) / 2
      swidth = imgWidth
      sheight = containerHeight / radio
    }
  }
  else if (type === 'contain') {
    if (iWHRatio >= cWHRatio) {
      // 横图，宽先匹配，高度自适应
      radio = containerWidth / imgWidth
      y = (containerHeight - imgHeight * radio) / 2
      height = imgHeight * radio
    }
    else {
      // 竖图，高先匹配，宽度自适应
      radio = containerHeight / imgHeight
      x = (containerWidth - imgWidth * radio) / 2
      width = imgWidth * radio
    }
  }
  return { sx, sy, swidth, sheight, x, y, width, height }
}
