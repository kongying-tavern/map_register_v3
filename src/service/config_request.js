import axios from "axios";

function fetch_config() {
  const url =
    import.meta.env.VITE_CONF_MODE === "dev"
      ? `${import.meta.env.VITE_ASSET_BASE}/dadian.dev.json`
      : `${import.meta.env.VITE_ASSET_BASE}/dadian.json`;
  return axios
    .get(`${url}?r=${Math.random()}`)
    .then((res) => res.data || {})
    .catch(() => ({}));
}

export { fetch_config };
