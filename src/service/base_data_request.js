import axios from 'axios'
import { create_notify } from "../api/common"
// const baseurl = 'http://momincong.com:8982/api'
const baseurl = 'http://localhost:9000/api'
async function default_request(method, url, data = undefined) {
    try {
        return await axios({
            method: method,
            url: url,
            data: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        if (error.response) {
            create_notify(error.response.data.msg, 'negative')
        } else if (error.request) {
            create_notify('链接失败，请稍后重试', 'negative')
        } else {
            create_notify(error.message, 'negative')
        }
    }
}
/**
 * 列出地区
 * @param {Number} parentId 父级ID,默认为-1
 * @param {Boolean} isTraverse 是否遍历子地区
 * @returns 地区信息
 */
function query_area(data) {
    return default_request('post', `${baseurl}/area/get/list`, data)
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
    return default_request('post', `${baseurl}/item/get/type/${self}`, data)
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
    return default_request('post', `${baseurl}/item/get/list`, data)
}
/**
 * 列出物品id列表
 * @param {Array} typeIdList 物品类型ID列表
 * @param {Array} areaIdList 地区ID列表
 * @param {Array} itemIdList 物品ID列表
 * @param {Number} getBeta 获取测试点位,默认为0，不获取，为1时只获取测试点位
 * @returns 物品点位id信息
 */
function query_itemlayer_idlist(data) {
    return default_request('post', `${baseurl}/marker/get/id`, data)
}
/**
 * 列出物品信息列表
 * @param {Array} data 物品类型ID列表
 * @returns 物品点位id信息
 */
function query_itemlayer_infolist(data) {
    return default_request('post', `${baseurl}/marker/get/list_byid`, data)
}
export {
    query_area,
    query_itemtype,
    query_itemlist,
    query_itemlayer_idlist,
    query_itemlayer_infolist
}