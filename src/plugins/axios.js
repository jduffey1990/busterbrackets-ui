import axios from 'axios';

import { useCookies } from 'vue3-cookies';

const { cookies } = useCookies();

export default {
  install: (app) => {
    const api = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      withCredentials: true,
      headers: {
        'X-CSRFToken': cookies.get('csrftoken'),
      },
    });

    app.config.globalProperties.$axios = api;
    app.provide('$axios', api);
  },
};
