import type { Coordinate2D } from '../core'

export const covertPosition = (positionExpression?: string): Coordinate2D | undefined => {
  if (!positionExpression)
    return
  try {
    const pos = positionExpression.split(',').map(Number).slice(0, 2)
    return pos as [number, number]
  }
  catch {
    return undefined
  }
}
