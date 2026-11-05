import axios from 'axios';
import { useCookies } from 'vue3-cookies';

export default {
  install: (app) => {
    const { cookies } = useCookies();

    // --- FIRST SERVICE: Users ---
    const usersApi = axios.create({
      baseURL: import.meta.env.VITE_USERS_BASE_URL,
      withCredentials: true,
    });

    usersApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // --- SECOND SERVICE: Brackets ---
    const bracketsApi = axios.create({
      baseURL: import.meta.env.VITE_BRACKETS_BASE_URL,
      withCredentials: true,
    });

    bracketsApi.interceptors.request.use((config) => {
      config.headers['X-CSRFToken'] = cookies.get('csrftoken');
      return config;
    });

    // Make them available in the Vue app
    app.config.globalProperties.$usersApi = usersApi;
    app.config.globalProperties.$bracketsApi = bracketsApi;

    app.provide('$usersApi', usersApi);
    app.provide('$bracketsApi', bracketsApi);
  },
};