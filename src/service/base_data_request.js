import axios from "axios";
import default_request from "./default_request";

const baseurl = `${import.meta.env.VITE_API_BASE}/api`;
// Const baseurl = 'http://localhost:9000/api/api'

/**
 * 列出地区
 * @param {Number} parentId 父级ID,默认为-1
 * @param {Boolean} isTraverse 是否遍历子地区
 * @returns 地区信息
 */
function query_area(data) {
  return default_request("post", `${baseurl}/area/get/list`, data);
}

/**
 * 列出物品类型
 * @param {Number} self 查询自身还是查询子级，0为查询自身，1为查询子级
 * @param {Array} typeIdList 父级类型ID列表
 * @param {Number} current 当前页，从0开始
 * @param {Number} size 每页大小，默认为10
 * @returns 物品类型信息
 */
function query_itemtype(self = 0, data) {
  return default_request("post", `${baseurl}/item_type/get/list/${self}`, data);
}

/**
 * 列出物品列表
 * @param {Array} typeIdList 末端物品类型ID列表
 * @param {Array} areaIdList 末端地区ID列表
 * @param {Number} current 当前页，从0开始
 * @param {Number} size 每页大小，默认为10
 * @returns 物品列表信息
 */
function query_itemlist(data) {
  return default_request("post", `${baseurl}/item/get/list`, data);
}

// /**
//  * 列出物品id列表
//  * @param {Array} typeIdList 物品类型ID列表
//  * @param {Array} areaIdList 地区ID列表
//  * @param {Array} itemIdList 物品ID列表
//  * @param {Number} getBeta 获取测试点位,默认为0，不获取，为1时只获取测试点位
//  * @returns 物品点位id信息
//  */
// function query_itemlayer_idlist(data) {
//     return default_request('post', `${baseurl}/marker/get/id`, data)
// }
/**
 * 列出物品信息列表
 * @param {Array} typeIdList 物品类型ID列表
 * @param {Array} areaIdList 地区ID列表
 * @param {Array} itemIdList 物品ID列表
 * @param {Number} getBeta 获取测试点位,默认为0，不获取，为1时只获取测试点
 * @returns 物品点位id信息
 */
function query_itemlayer_infolist(data) {
  return default_request("post", `${baseurl}/marker/get/list_byinfo`, data);
}

/**
 * 列出物品点位信息
 * @param {Array} typeIdList 物品类型ID列表
 * @param {Array} tagList 标签名列表
 * @param {Number} current 当前页，从0开始
 * @param {Number} size 每页大小，默认为10
 * @returns 物品点位id信息
 */
function query_itemlayer_icon(data) {
  return default_request("post", `${baseurl}/tag/get/list`, data);
}

/**
 * 上传图片
 * @param {Array} file_data 图片的base64
 * @param {Array} file_name 图片名字
 * @returns 物品点位id信息
 */
function upload_img(file_name, file_data) {
  const data = new FormData();
  data.append("file_name", file_name);
  data.append("file_data", file_data);
  return axios({
    method: "post",
    data,
    url: import.meta.env.VITE_IMG_UPLOAD_URL,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

// 检验图片是否有效
function check_img(url) {
  return axios.get(url);
}

export {
  query_area,
  query_itemtype,
  query_itemlist,
  // Query_itemlayer_idlist,
  query_itemlayer_infolist,
  query_itemlayer_icon,
  upload_img,
  check_img,
};
