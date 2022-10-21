import L from 'leaflet'

export class MapUtil {
  /** 获取坐标参考系（CRS），本地图使用 simple 类型 CRS，将经度和纬度直接映射到 x 和 y */
  static getMapCRS = (x: number, y: number, w: number, h: number) => {
    return L.Util.extend({}, L.CRS.Simple, {
      /** 用给定的系数表示变换对象 */
      transformation: new L.Transformation(1, 0, 1, 0),
      projection: {
        /** 将地理坐标投影为 CRS 所接受的单位坐标 */
        project(latlng: L.LatLng) {
          return new L.Point(latlng.lat + x, latlng.lng + y)
        },
        /** 给定 CRS 坐标，反向投影为地理坐标 */
        unproject(point: L.Point) {
          return new L.LatLng(point.x - x, point.y - y)
        },
      },
      /** 以像素坐标表示矩形区域 */
      bounds: L.bounds(L.point(0, 0), L.point(w, h)),
    })
  }
}
