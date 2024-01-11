import default_request from "./default_request";
const baseurl = `${import.meta.env.VITE_API_BASE}/api`;
// Const baseurl = 'http://localhost:9000/api/api'

// 上传点位
function upload_layer(data) {
  return default_request("put", `${baseurl}/marker/single`, data);
}

// 修改点位
function edit_layer(data) {
  return default_request("post", `${baseurl}/marker/single`, data);
}

// 删除点位
function delete_layer(data) {
  return default_request("delete", `${baseurl}/marker/${data}`);
}

// 上传点位额外信息
function upload_layer_extralabel(data) {
  return default_request("put", `${baseurl}/marker/extra`, data);
}

function edit_layer_extralabel(data) {
  return default_request("post", `${baseurl}/marker/extra`, data);
}

export {
  upload_layer,
  edit_layer,
  delete_layer,
  upload_layer_extralabel,
  edit_layer_extralabel,
};
