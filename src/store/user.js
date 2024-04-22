import { defineStore } from 'pinia';

import { useCookies } from 'vue3-cookies';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {},
    valuesProfile: [],
    companyPreferences: [],
  }),
  getters: {
    isLoggedIn(state) {
      return !!state.user.email;
    },
  },
  actions: {
    async getValuesProfile({ advisor_uuid, client_uuid, dontRefresh }) {
      if (this.valuesProfile.length && dontRefresh) {
        return this.valuesProfile;
      }

      const { data } = await this.$axios.get(
        `/api/advisors/${advisor_uuid}/clients/${client_uuid}/responses/`
      );

      this.valuesProfile = data;

      return data;
    },
    async getCompanyPreferences({ advisor_uuid, client_uuid, dontRefresh }) {
      if (this.companyPreferences.length && dontRefresh) {
        return this.companyPreferences;
      }

      const { data } = await this.$axios.get(
        `/api/advisors/${advisor_uuid}/clients/${client_uuid}/company-preferences/`
      );

      this.companyPreferences = data;

      return data;
    },
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
