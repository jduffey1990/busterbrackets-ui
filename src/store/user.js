import { defineStore } from 'pinia';
import router from '@/router';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
  }),
  getters: {
    getUser(state) {
      return state.user;
    },
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

      window.location.reload();
    },
    async logout() {
      await this.$axios('/api/users/logout/');

      await this.getSession();

      window.location.reload();
    },
  },
});
