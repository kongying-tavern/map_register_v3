import axios from "axios";
import { user_refresh_token } from "src/service/user_info";
// 登录获取token
function get_token(username, password, grant_type = "password") {
  const data = new FormData();
  data.append("grant_type", grant_type);
  data.append("username", username);
  data.append("password", password);
  return axios({
    method: "post",
    url: `${import.meta.env.VITE_API_BASE}/oauth/token`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Basic Y2xpZW50OnNlY3JldA==",
    },
    data,
  });
}

function refresh_token() {
  return axios({
    method: "post",
    url: `${import.meta.env.VITE_API_BASE}/oauth/token`,
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: "Basic Y2xpZW50OnNlY3JldA==",
    },
    params: {
      refresh_token: user_refresh_token.value,
      grant_type: "refresh_token",
    },
  });
}

export { get_token, refresh_token };
