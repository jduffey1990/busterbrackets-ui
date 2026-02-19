// src/store/user.js
import router from '@/router';
import { defineStore } from 'pinia';
import { useCookies } from 'vue3-cookies';

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {},
        token: localStorage.getItem('token') || null,
        llmCache: {}
    }),
    getters: {
        isLoggedIn(state) {
            return !!state.user.email;
        },
        // ─── NEW: admin check based on role field from the users service ───
        isAdmin(state) {
            return state.user.role === 'admin';
        },
    },
    actions: {
        getCachedResponse(id) {
            return this.llmCache[id] || null;
        },
        setCachedResponse(id, response) {
            this.llmCache[id] = response;
            console.log("description cached for id");
        },
        async login(credentials) {
            try {
                const response = await this.$users({
                    method: 'post',
                    url: '/login',
                    data: credentials,
                });
                const tokenReturned = response.data.token;
                const userReturned = response.data.user;

                localStorage.setItem('token', tokenReturned);
                this.user = userReturned;
                this.token = tokenReturned;

                this.$users.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                this.$brackets.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;

                router.push('/dashboard');
            } catch (error) {
                throw error;
            }
        },
        async getSession() {
            if (!this.token) return;
            this.$users.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            this.$brackets.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
            try {
                const response = await this.$users.get('/session');
                this.user = response.data.user;
            } catch (error) {
                this.token = null;
                this.user = {};
                localStorage.removeItem('token');
            }
        },
        async logout(apiInstance) {
            this.user = {};
            this.token = null;
            localStorage.removeItem('token');
            delete this.$users.defaults.headers.common['Authorization'];
            delete this.$brackets.defaults.headers.common['Authorization'];
            router.push('/login');
        },
    },
});