// Utilities

import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    // firebase: {
    //   apiKey: 'AIzaSyDtLpvU---MHI5KloDx7mznNb7YjH7lmrY',
    //   authDomain: 'inicio-test-87421.firebaseapp.com',
    //   projectId: 'inicio-test-87421',
    //   storageBucket: 'inicio-test-87421.appspot.com',
    //   messagingSenderId: '732867820613',
    //   appId: '1:732867820613:web:26b240902151fb5d4e772c',
    // },
    user: {},
  }),
  getters: {
    getUser(state) {
      return state.user;
    },
    isLoggedIn(state) {
      return !!state.user.username;
    },
  },
  actions: {
    async login(credentials) {
      // await this.$axios.get('/csrf');

      await this.$axios({
        method: 'post',
        url: '/api/auth/',
        data: credentials,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      this.user = {
        username: credentials.email,
      };
    },
    async register(credentials) {
      // await this.$axios.get('/csrf');

      await this.$axios({
        method: 'post',
        url: '/api/auth/register',
        data: credentials,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  },
});
