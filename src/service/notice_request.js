import _ from "lodash";
import md5Hex from "md5-hex";
import default_request from "./default_request";

const baseurl = `${import.meta.env.VITE_API_BASE}/api`;
const noticeHashKey = "_yuanshen_dadian_notice_hash";

function list_notice(data, instance) {
  return default_request("post", `${baseurl}/notice/get/list`, data, instance);
}

function get_notice_hash(list = []) {
  const idList = _.chain(list)
    .filter((v) => Number(v.id))
    .map((v) => `${Number(v.id)}__${v.updateTime}`)
    .uniq()
    .sort()
    .value();
  const idListStr = _.join(idList, "|");
  const idHash = md5Hex(idListStr);
  return idHash;
}

function compare_hash(hash = "") {
  const storedHash = localStorage.getItem(noticeHashKey) || "";
  const compareHash = hash || "";
  return storedHash === compareHash;
}

function update_hash(hash = "") {
  const storeHash = hash || "";
  localStorage.setItem(noticeHashKey, storeHash);
}

export { list_notice, get_notice_hash, compare_hash, update_hash };
