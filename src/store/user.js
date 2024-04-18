import { defineStore } from 'pinia';

import { useCookies } from 'vue3-cookies';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
  }),
  getters: {
    isLoggedIn(state) {
      return !!state.user.email;
    },
  },
  actions: {
    async getSession() {
      const { data } = await this.$axios('/api/users/session/');

      this.user = data;
    },
    async register(credentials) {
      await this.$axios({
        method: 'post',
        url: '/api/auth/register',
        data: credentials,
      });

      await this.getSession();
    },
    async login(credentials) {
      await this.$axios({
        method: 'post',
        url: '/api/users/login/',
        data: credentials,
      });

      await this.getSession();
    },
    async logout() {
      await this.$axios('/api/users/logout/');

      const { cookies } = useCookies();

      cookies.remove('sessionid');
      cookies.remove('csrftoken');

      window.location.reload();
    },
  },
});
