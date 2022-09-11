import axios from 'axios'
//登录获取token
function get_token(username, password, grant_type = 'password') {
    var data = new FormData();
    data.append('grant_type', grant_type);
    data.append('username', username);
    data.append('password', password);
    return axios({
        method: 'post',
        url: `${process.env.VITE_API_BASE}/oauth/token`,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Basic Y2xpZW50OnNlY3JldA=='
        },
        data: data
    })
}
function refresh_token() {
    return axios({
        method: 'post',
        url: `${process.env.VITE_API_BASE}/oauth/token`,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': 'Basic Y2xpZW50OnNlY3JldA=='
        },
        params: {
            refresh_token: localStorage.getItem('_yuanshen_dadian_refresh_token'),
            grant_type: 'refresh_token'
        }
    });
}
export {
    get_token, refresh_token

}
