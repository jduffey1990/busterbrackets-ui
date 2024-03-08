import axios from 'axios';

export default {
  install: (app, options = {}) => {
    const api = axios.create({
      baseURL: import.meta.env.VITE_URLROOT,
      withCredentials: true,
      ...options,

      // headers: {
      //   Authorization: options.token ? `Bearer ${options.token}` : '',
      // },
    });

    app.config.globalProperties.$axios = api;
    app.provide('$axios', api);
  },
};
