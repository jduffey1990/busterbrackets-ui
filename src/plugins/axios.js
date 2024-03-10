import axios from 'axios';

export default {
  install: (app) => {
    const api = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      withCredentials: true,
    });

    app.config.globalProperties.$axios = api;
    app.provide('$axios', api);
  },
};
