import axios from 'axios';
import { get_user_token } from './user_info'
import { create_notify } from "../api/common"

export default function default_request(method, url, data = undefined) {
    return axios({
        method,
        url,
        data: JSON.stringify(data),
        transformRequest(data) {
            if (get_user_token() === null) {
                window.alert('登录认证已失效，请重新登录！')
                window.location.reload();
            }

            return data
        },
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${get_user_token()}`
        }
    })
    .then(res => {
        const {error, message} = res.data

        if(error) {
            create_notify(message, 'negative')
            throw 'DATA_ERROR'; // eslint-disable-line
        }

        return res;
    })
    .catch(error => {
        if(error === 'DATA_ERROR') {
            // Nothing to do
        } else if (error.response) {
            create_notify(`${error.response.status} ${error.response.statusText}`, 'negative')
        } else if (error.request) {
            create_notify('链接失败，请稍后重试', 'negative')
        } else {
            create_notify(error.message, 'negative')
        }
    })
}
