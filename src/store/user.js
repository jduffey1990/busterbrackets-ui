import {defineStore} from 'pinia';

import {useCookies} from 'vue3-cookies';



export const useUserStore = defineStore('user', {
    state: () => ({
        user: {},
        stripePublicKey: "",
    }),
    getters: {
        isLoggedIn(state) {
            return !!state.user.email;
        }
    },
    actions: {

        async getSession() {
            const {data} = await this.$axios('/api/users/session/');
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
            try {
                await this.$axios({
                    method: 'post',
                    url: '/api/users/login/',
                    data: credentials,
                });
                
                await this.getSession();
            } catch (error) {
                // Re-throw the error to be caught in `loginUser`
                throw error;
            }
        },
        async logout() {
            await this.$axios('/api/users/logout/');

            const {cookies} = useCookies();

            cookies.remove('sessionid');
            cookies.remove('csrftoken');

            this.user = {};
            window.location.href = '/login';
        },
        async fetchUserData() {
            console.log("we are fetching!")
            const {data} = await this.$axios('/api/users/me');
            console.log("user data", data)
            this.user = data;
        },
    },
});
