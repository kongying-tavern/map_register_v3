import axios from 'axios'
//登录获取token
function get_token(username, password, grant_type = 'password') {
    var data = new FormData();
    data.append('grant_type', grant_type);
    data.append('username', username);
    data.append('password', password);
    return axios({
        method: 'post',
        url: `https://cloud.yuanshen.site/oauth/token`,
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