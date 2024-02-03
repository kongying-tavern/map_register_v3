import default_request from "./default_request";
const baseurl = `${import.meta.env.VITE_API_BASE}/api`;

function list_notice(data) {
  return default_request("post", `${baseurl}/notice/get/list`, data);
}

export { list_notice };
