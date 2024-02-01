import axios from "axios";

function auth_guide() {
  return axios({
    url: import.meta.env.VITE_GUIDE_TEST_URL,
    auth: {
      username: import.meta.env.VITE_GUIDE_USER,
      password: import.meta.env.VITE_GUIDE_PASS,
    },
  })
    .then(() => true)
    .catch(() => false);
}

export { auth_guide };
