import axios from 'axios';

import { useCookies } from 'vue3-cookies';

export default {
  install: (app) => {
    const { cookies } = useCookies();

    const api = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      withCredentials: true,
    });

    api.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    app.config.globalProperties.$axios = api;
    app.provide('$axios', api);
  },
};
