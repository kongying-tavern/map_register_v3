import axios from 'axios'
import { create_notify } from "../api/common"
// const baseurl = 'http://momincong.com:8101/api'
const baseurl = 'http://localhost:9000/api'
//登录获取token
function get_token(username, password, grant_type = 'password') {
    var data = new FormData();
    data.append('grant_type', grant_type);
    data.append('username', username);
    data.append('password', password);
    return axios({
        method: 'post',
        url: `${baseurl}/oauth/token`,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Basic Y2xpZW50OnNlY3JldA=='
        },
        data: data
    })
}
export {
    get_token
}