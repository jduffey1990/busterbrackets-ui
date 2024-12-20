import {defineStore} from 'pinia';

import {useCookies} from 'vue3-cookies';
import {Role} from '@/enums/user';
import {formatDate} from "@/utils/string";

const firmAdminPermissions = [Role.FIRM_ADMIN, Role.SUPER];
const advisorPermissions = [...firmAdminPermissions, Role.ADVISOR];

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {},
        stripePublicKey: "",
    }),
    getters: {
        isSuper(state) {
            return state.user.role === Role.SUPER;
        },
        isFirmAdminOrGreater(state) {
            return firmAdminPermissions.includes(state.user.role);
        },
        isAdvisorOrGreater(state) {
            return advisorPermissions.includes(state.user.role);
        },
        isLoggedIn(state) {
            return !!state.user.email;
        },
        stripeAccountAssociated(state) {
            return !!state.user.firm.stripe_subscription_id;
        },
        stripeIsCurrent(state) {
            if (state.user.firm.subscription_end_date > 0) {
                const currentUnixTime = Math.floor(Date.now() / 1000); // Convert current time to Unix timestamp
                return state.user.firm.subscription_end_date >= currentUnixTime;
            } else {
                return false;
            }
        },
        stripeIsPaused(state) {
            return !!state.user.firm.paused_subscription;
        },
        cardOnFile(state) {
            return !!state.user.firm.card_on_file;
        }
    },
    actions: {
        async getValuesProfile({advisor_id, user_id}) {
            // Helper function to map, filter, and sort the data (Original code wrapped for multi-use)
            function mappedData(apiResponse) {
                return apiResponse
                    .map((data) => ({
                        ...data,
                        value: JSON.parse(data.value),
                    }))
                    .filter((data) => data.question.value !== false)
                    .sort(
                        (a, b) =>
                            a.sections.position - b.sections.position ||
                            a.question.response_type.localeCompare(b.question.response_type) ||
                            a.question.text.localeCompare(b.question.text)
                    );
            }

            // First attempt: Fetch values profile directly from the new endpoint
            const response1 = await this.$axios.get(`/api/users/${user_id}/values-profile/`);
            const data1 = response1.data;

            if (data1.length) {
                return mappedData(data1);  // Return the mapped data if available
            } else {
                // If the array is empty, fall back to the original endpoint
                const response2 = await this.$axios.get(
                    `/api/advisors/${advisor_id}/clients/${user_id}/responses/`
                );
                const data2 = response2.data;

                return mappedData(data2);  // Return the mapped data from the second endpoint
            }
        },

        async getSession() {
            const {data} = await this.$axios('/api/users/session/');
            const {public_key: publicKey} = (await this.$axios.get("/api/general/config/public-key")).data;

            this.user = data;
            this.stripePublicKey = publicKey

            this.initializePendo();
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
        initializePendo() {
            if (this.user && Object.keys(this.user).length !== 0 && !this.isSuper) {
                pendo.initialize({
                    visitor: {
                        id: this.user.id,
                        email: this.user.email,
                        full_name: this.user.full_name,
                        role: this.user.role
                    },
                    account: {
                        id: this.user.firm.id,
                        name: this.user.firm.name,
                        planLevel: this.user.firm.fee_rate
                    }
                });
            }
        },
        async fetchUserData() {
            console.log("we are fetching!")
            const {data} = await this.$axios('/api/users/me');
            console.log("user data", data)
            this.user = data;
        },
    },
});
