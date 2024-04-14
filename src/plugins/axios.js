import axios from 'axios';

export default {
  install: (app) => {
    const api = axios.create({
      baseURL: import.meta.env.VITE_BASE_URL,
      withCredentials: true,
      headers: {
        'X-CSRFToken': document.cookie
          .match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)')
          ?.pop(),
      },
    });

    app.config.globalProperties.$axios = api;
    app.provide('$axios', api);
  },
};
