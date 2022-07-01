import axios from 'axios'
import { create_notify } from "../api/common"
// const baseurl='http://momincong.com:8982'
async function defalut_request(method, url, data) {
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
 * @param {Number} parentId 父级ID,默认为-1
 * @param {Boolean} isTraverse 是否遍历子地区
 * @returns 地区信息
 */
function query_area(data) {
    return defalut_request('get', `/api/area/list`, data)
}
export {
    query_area
}