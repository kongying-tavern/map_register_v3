import axios from 'axios'
//授权码登录模式
function gitee_login_typeauthcode(data) {
    return axios({
        method: 'post',
        url: 'https://gitee.com/oauth/token',
        params: {
            grant_type: 'authorization_code',
            code: data.code,
            client_id: '277ea02bae5fce96d432b7609ba03266482c00ef2d99639c71f5d3389ff01228',
            redirect_uri: 'http://localhost:8080/',
            client_secret: 'bf49d65a1a9e66878a29ff71756d599243206959d24cc1dc623de3d8dfcfb049',
        }
    })
}
//
export {
    gitee_login_typeauthcode
}