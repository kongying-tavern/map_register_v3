import axios from "axios";

function fetch_config() {
  return axios
    .get(`https://assets.yuanshen.site/dadian.json?r=${Math.random()}`)
    .then((res) => res.data || {})
    .catch(() => ({}));
}

export { fetch_config };
