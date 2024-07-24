import {defineStore} from 'pinia';

import {useCookies} from 'vue3-cookies';
import {Role} from '@/enums/user';

const firmAdminPermissions = [Role.FIRM_ADMIN, Role.SUPER];
const advisorPermissions = [...firmAdminPermissions, Role.ADVISOR];

export const useUserStore = defineStore('user', {
    state: () => ({
        user: {},
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
    },
    actions: {
        async getValuesProfile({advisor_id, user_id}) {
            const {data} = await this.$axios.get(
                `/api/advisors/${advisor_id}/clients/${user_id}/responses/`
            );

            return data
                .map((d) => ({
                    ...d,
                    value: JSON.parse(d.value),
                }))
                .filter((d) => d.question.value !== false)
                .sort(
                    (a, b) =>
                        a.sections.position - b.sections.position ||
                        a.question.response_type.localeCompare(b.question.response_type) ||
                        a.question.text.localeCompare(b.question.text)
                );
        },
        async getSession() {
            const {data} = await this.$axios('/api/users/session/');

            this.user = data;
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
            await this.$axios({
                method: 'post',
                url: '/api/users/login/',
                data: credentials,
            });

            await this.getSession();


        },
        async logout() {
            await this.$axios('/api/users/logout/');

            const {cookies} = useCookies();

            cookies.remove('sessionid');
            cookies.remove('csrftoken');

            this.user = {};
        },
        initializePendo() {
            if (this.user && Object.keys(this.user).length !== 0) {
                pendo.initialize({
                    visitor: {
                        id: this.user.id,
                        email: this.user.email,
                        firstName: this.user.firstName,
                        lastName: this.user.lastName,
                        role: this.user.role
                    },
                    account: {
                        id: this.user.firm,
                        accountName: this.user.advisor_id,
                        payingStatus: this.user.is_archived ? 'inactive' : 'active',
                    }
                });
            }
        }
    },
});
