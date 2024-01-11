// 点位相关
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
// Import "../api/leaflet_markercluster/leaflet.markercluster-src.js";
// import "../api/leaflet_markercluster/MarkerCluster.css"
// import "../api/leaflet_markercluster/MarkerCluster.Default.css"
/**
 * 生成点位背景
 * @param {Object} data 点位数据对象
 * @param {string} type 点位背景的类型 off：默认；on：选中态；none：无背景
 * @returns {Object} icon对象
 */
function create_icon_options(url, type = "off") {
  let options = {
    type,
    iconUrl: url || `${import.meta.env.VITE_ASSET_BASE}/icons/-1.png`,
    shadowUrl: `${import.meta.env.VITE_ASSET_BASE}/icons/loc_02_${type}.png`,
    iconSize: [22, 22], // Size of the icon
    shadowSize: [32, 36], // Size of the shadow
    iconAnchor: [11, 30], // Point of the icon which will correspond to marker's location
    shadowAnchor: [16, 35], // The same for the shadow
    popupAnchor: [0, -35], // Point from which the popup should open relative to the iconAnchor
  };
  if (type === "none") {
    options = {
      ...options,
      iconSize: [22, 22], // Size of the icon
      iconAnchor: [11, 11], // Point of the icon which will correspond to marker's location
      popupAnchor: [0, -22], // Point from which the popup should open relative to the iconAnchor
    };
  }

  return options;
}

/**
 * 生成点位
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} marker对象
 */
function layer_register(data, iconurl) {
  const marker = L.marker(data.position.split(","), {
    icon: L.icon(create_icon_options(iconurl)),
    data: { ...data },
    draggable: false,
  });
  return marker;
}

/**
 * 生成点位组
 * @param {array} data  要生成点位的点位数据数组
 * @param {String} iconurl 点位图标链接
 * @returns {Object} layerGroup对象
 */
function layergroup_register(data = [], iconurl) {
  const layerGroup = L.layerGroup();
  for (const i of data) {
    layerGroup.addLayer(layer_register(i, iconurl));
  }

  return layerGroup;
}

/**
 * 标记/取消标记点位
 * @param {array} layer  要标记/取消标记的点位
 * @returns {Object} 标记/取消标记后的点位
 */
function layer_mark(layer) {
  const { type } = layer.options.icon.options;
  let icon = "";
  if (type === "on") {
    icon = L.icon(
      create_icon_options(layer.options.icon.options.iconUrl, "off")
    );
  } else {
    icon = L.icon(
      create_icon_options(layer.options.icon.options.iconUrl, "on")
    );
  }

  layer = layer.setIcon(icon);
  return layer;
}

/**
 * 为点位着色
 * @param {array} layer  要着色的点位
 * @returns {Object} 着色后的点位
 */
// function layer_dye(layer, type) {
//     const icon = L.icon(create_icon_options(layer.options.icon.options.iconUrl, type));
//     layer = layer.setIcon(icon);
//     return layer
// }

export { create_icon_options, layer_register, layergroup_register, layer_mark };
