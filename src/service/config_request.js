import axios from "axios";

function fetch_config() {
  return axios
    .get("https://assets.yuanshen.site/dadian.json")
    .then((res) => res.data || {})
    .catch(() => ({}));
}

export { fetch_config };
