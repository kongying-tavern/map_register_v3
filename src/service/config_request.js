import axios from "axios";

function fetch_config() {
  const url =
    process.env.VITE_CONF_MODE === "dev"
      ? "https://assets.yuanshen.site/dadian.dev.json"
      : "https://assets.yuanshen.site/dadian.json";
  return axios
    .get(`${url}?r=${Math.random()}`)
    .then((res) => res.data || {})
    .catch(() => ({}));
}

export { fetch_config };
