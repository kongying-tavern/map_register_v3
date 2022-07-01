//地图初始化
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
//初始化地图中心和地图尺寸
const mapCenter = [3568, 6286], mapSize = [12288, 15360]
//注册地图瓦片
function create_map_layer(area_idx) {
    L.TileLayer.T = L.TileLayer.extend({
        getTileUrl: function (coords) {
            var x = coords.x,
                y = coords.y,
                z = coords.z + 13
            return `https://assets.yuanshen.site/tiles_${area_idx}/${z}/${x}_${y}.png`
        },
        //如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
        reuseTiles: true,
    });
    let tiles = new L.TileLayer.T('', {
        maxZoom: 10,
        minZoom: -6,
        maxNativeZoom: 0,
        minNativeZoom: -3,
        bounds: L.latLngBounds(
            L.latLng(-mapCenter[0], -mapCenter[1]),
            L.latLng(mapSize[0] - mapCenter[0], mapSize[1] - mapCenter[1])
        ),
    });
    return tiles
}
// 注册地图参数
function create_map() {
    //设置地图要使用的坐标参考系（CRS），本地图使用simple类型CRS，将经度和纬度直接映射到x和y。
    let mapCRS = L.Util.extend({}, L.CRS.Simple, {
        //用给定的系数表示变换对象。
        transformation: new L.Transformation(1, 0, 1, 0),
        projection: {
            //将地理坐标投影为CRS所接受的单位坐标
            project: function (latlng) {
                return new L.Point(latlng.lat + mapCenter[0], latlng.lng + mapCenter[1])
            },
            //给定CRS坐标，反向投影为地理坐标
            unproject: function (point) {
                return new L.LatLng(point.x - mapCenter[0], point.y - mapCenter[1])
            },
        },
        //以像素坐标表示矩形区域
        bounds: L.bounds(L.point(0, 0), L.point(mapSize[0], mapSize[1])),
    })
    let map_setting = {
        crs: mapCRS,
        center: [2576, 1742],
        zoomDelta: 0,
        zoomSnap: 0.5,
        maxZoom: 2,
        minZoom: -4,
        zoom: -4,
        tap: false,
        maxBounds: L.latLngBounds(
            L.latLng(-mapCenter[0] - 10000, -mapCenter[1] - 10000),
            L.latLng(mapSize[0] - mapCenter[0] + 10000, mapSize[1] - mapCenter[1] + 10000)
        ),
        attributionControl: false,
        zoomControl: false,
    }
    let map = L.map('map', map_setting);
    return map
}
//注册地图
function insert_maplayer(map, map_layer) {
    map.addLayer(map_layer);
    return map;
}
//切换地图
function switch_map(map, map_layer) {
    map.eachLayer(layer => {
        map.removeLayer(layer);
    });
    map.addLayer(map_layer);
    return map
}
//添加地图蒙层(群岛)
const qd_postion = {
    ww: [
        [-494, -1164],
        [1554, -140],
    ],
    pp: [
        [-581, -3214],
        [443, -2190],
    ],
    ss: [
        [528, -4237],
        [2576, -2189],
    ],
    bd: [
        [1433, -1841],
        [2201, -1046],
    ],
}
function add_map_overlay_qd(type, index) {
    let imageUrl = `https://assets.yuanshen.site/tiles_qd28/other/${type}/${index}.png`;
    let imageBounds = [qd_postion[type]]
    return L.imageOverlay(imageUrl, imageBounds)
}
export {
    create_map_layer,
    create_map,
    insert_maplayer,
    switch_map,
    add_map_overlay_qd
}