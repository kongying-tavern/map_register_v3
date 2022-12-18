// 地图初始化
import _ from 'lodash'
import * as L from 'leaflet'
import "leaflet/dist/leaflet.css";
import { is_neigui } from 'src/service/user_info';

// 初始化地图中心和地图尺寸
/**
 * 获取地图瓦片配置
 */
const map_tiles_config = {
    '提瓦特-base0': {
        extension: 'png',
        code: 'twt31',
        settings: {
          center: [0, 1742],
        },
        center: [3568, 6286],
        size: [16384, 15360],
        tilesOffset: [-4864, 0]
    },
    '提瓦特-base1': {
        extension: 'png',
        center: [3568, 6286],
        size: [12288, 15360]
    },
    '金苹果-base0': {
        extension: 'jpg',
        settings: {
            center: [600, -2190],
            zoom: -2
        },
        center: [3568, 6286],
        size: [8192, 8192]
    },
    'A:APPLE:1_6_STG1': {
        extend: '金苹果-base0',
        name: '涨潮群岛',
        code: 'qd',

    },
    'A:APPLE:1_6_STG2': {
        extend: '金苹果-base0',
        name: '退潮群岛',
        code: 'qd1',
    },
    'A:APPLE:2_8': {
        extension: 'png',
        name: '金苹果群岛',
        code: 'qd28',
        settings: {
            center: [600, -2190],
            zoom: -2
        },
        center: [3568, 6286],
        size: [8192, 8192]
    },
    'A:LY:CENGYAN_UG': {
        extend: '提瓦特-base1',
        name: '地下矿区',
        code: 'cyjy',
        settings: {
            center: [1800, -500],
            zoom: -3
        }
    },
    'A:DQ:YUANXIAGONG': {
        extend: '提瓦特-base1',
        name: '渊下宫',
        code: 'yxg',
        settings: {
            center: [2000, 300],
            zoom: -4
        }
    },
    'A:DQ:SANJIE': {
        extend: '提瓦特-base1',
        name: '三界路飨祭',
        code: 'yxg',
        settings: {
            center: [2000, 300],
            zoom: -4
        }
    }
};

const map_tiles_neigui_config = {
    '提瓦特-base0': {
        code: 'twt34',
        settings: {
          center: [0, 1742],
        },
        center: [3568, 6286],
        size: [16384, 15360],
        tilesOffset: [-4864, 0]
    }
};

/**
 * 获取地图插件配置
 */
const map_plugin_config = {
    'A:APPLE:2_8': {
        extra: ['2_8_island']
    },
};

function get_map_plugin_config(area_code = '') {
    return map_plugin_config[area_code] || {};
}

/**
 * 注册地图瓦片
 * @param {string} area_idx 地图别名 twt25：大世界 qd28：梦想群岛 yxg2：渊下宫/三界路飨祭 qd:群岛1 qd2:群岛2
 * @param {Array} mapCenter 地图中心坐标
 * @param {Array} mapSize 地图尺寸
 * @param {Array} mapTilesOffset 地图瓦片的偏移
 * @returns 地图瓦片对象
 */
function create_map_layer(area_idx, mapCenter, mapSize, mapTilesOffset = [0, 0], extension = 'png') {
    const tiles_preUrl = 'https://assets.yuanshen.site/tiles_'

    L.TileLayer.T = L.TileLayer.extend({
        getTileUrl (coords) {
            const {x} = coords;
                const {y} = coords;
                const z = coords.z + 13
            return `${tiles_preUrl}${area_idx}/${z}/${x}_${y}.${extension}`
        },
        // 如果此项为true，在平移后不可见的切片被放入一个队列中，在新的切片开始可见时他们会被取回（而不是动态地创建一个新的）。这理论上可以降低内存使用率并可以去除在需要新的切片时预留内存。
        reuseTiles: true,
    });
    const tiles = new L.TileLayer.T('', {
        maxZoom: 10,
        minZoom: -6,
        maxNativeZoom: 0,
        minNativeZoom: -3,
        bounds: L.latLngBounds(
            L.latLng(-mapCenter[0] + mapTilesOffset[0], -mapCenter[1] + mapTilesOffset[1]),
            L.latLng(mapSize[0] - mapCenter[0] + mapTilesOffset[0], mapSize[1] - mapCenter[1] + mapTilesOffset[1])
        ),
    });
    return tiles
}

/**
 * 生成地图
 * @param {string} area_idx 地图别名 twt25：大世界 qd28：梦想群岛 yxg2：渊下宫/三界路飨祭 qd:群岛1 qd2:群岛2
 * @param {object} settings leaflet 地图设置
 * @param {Array} mapCenter 地图中心坐标
 * @param {Array} mapSize 地图尺寸
 * @returns 地图对象
 */
function create_map(area_config_code = '') {
    const map_load_config = is_neigui() ? _.defaults({}, map_tiles_neigui_config, map_tiles_config) : map_tiles_config;
    let tiles_config = map_load_config[area_config_code] || map_load_config['提瓦特-base0'];
    const tiles_extend_name = tiles_config.extend || '';
    if(tiles_extend_name) {
        tiles_config = _.defaultsDeep({}, tiles_config, map_load_config[tiles_extend_name] || {});
    }

    const area_code = tiles_config.code;
    if(!area_code) {
        return;
    }

    const {settings} = tiles_config;
    const mapCenter = tiles_config.center || [3568, 6286];
    const mapSize = tiles_config.size || [12288, 15360];
    const mapTilesOffset = tiles_config.tilesOffset || [0, 0];
    const extension = tiles_config.extension || 'png';

    // 设置地图要使用的坐标参考系（CRS），本地图使用simple类型CRS，将经度和纬度直接映射到x和y。
    const mapCRS = L.Util.extend({}, L.CRS.Simple, {
        // 用给定的系数表示变换对象。
        transformation: new L.Transformation(1, 0, 1, 0),
        projection: {
            // 将地理坐标投影为CRS所接受的单位坐标
            project (latlng) {
                return new L.Point(latlng.lat + mapCenter[0], latlng.lng + mapCenter[1])
            },
            // 给定CRS坐标，反向投影为地理坐标
            unproject (point) {
                return new L.LatLng(point.x - mapCenter[0], point.y - mapCenter[1])
            },
        },
        // 以像素坐标表示矩形区域
        bounds: L.bounds(L.point(0, 0), L.point(mapSize[0], mapSize[1])),
    })
    const map_setting = {
        crs: mapCRS,
        center: [2576, 1742],
        zoomDelta: 0,
        zoomSnap: 0.5,
        maxZoom: 2,
        minZoom: -4,
        zoom: -4,
        tap: false,
        maxBounds: L.latLngBounds(
            L.latLng(-mapCenter[0] + mapTilesOffset[0] - 10000, -mapCenter[1] + mapTilesOffset[1] - 10000),
            L.latLng(mapSize[0] - mapCenter[0] + mapTilesOffset[0] + 10000, mapSize[1] - mapCenter[1] + mapTilesOffset[1] + 10000)
        ),
        attributionControl: false,
        zoomControl: false,
        ...settings
    }

    const tiles = create_map_layer(area_code, mapCenter, mapSize, mapTilesOffset, extension);
    const map = L.map('map', map_setting).addLayer(tiles);
    return map
}

// 添加地图蒙层(群岛)
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
        [1433, -1814],
        [2201, -1046],
    ],
}

function add_map_overlay_qd(type, index) {
    const imageUrl = `https://assets.yuanshen.site/tiles_qd28/other/${type}/${index}.png`;
    const imageBounds = [qd_postion[type]]
    return L.imageOverlay(imageUrl, imageBounds)
}

export {
    get_map_plugin_config,
    create_map_layer,
    create_map,
    add_map_overlay_qd
}
