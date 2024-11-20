import {createRouter, createWebHistory} from 'vue-router';
import Login from '@/views/Login.vue';
import Survey from '@/views/Survey.vue';
import Dashboard from '@/views/Dashboard.vue';
import InvestmentPreferences from '@/views/InvestmentPreferences.vue';

import Client from '@/views/Client.vue';
import Home from '@/views/Home.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import {useUserStore} from '@/store/user';
import Admin from '@/views/Admin.vue';
import Billing from '@/views/Billing.vue';
import Settings from '@/views/Settings.vue';
import Accounts from '@/views/Accounts.vue';
import Advisors from '@/views/Advisors.vue';
import Failure from "@/components/Failure.vue";
import AdvisorBlocked from "@/components/AdvisorBlocked.vue";
import Success from "@/components/Success.vue";
import SubSuccess from "@/components/SubSuccess.vue";
import PaymentInfo from "@/components/PaymentInfo.vue";


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Home',
            component: Home,
            beforeEnter: (to, from, next) => {
                const {isLoggedIn} = useUserStore();


                if (!isLoggedIn) {
                    return next();
                }

                next('/dashboard');
            },
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
            beforeEnter: (to, from, next) => {
                const {isAdvisorOrGreater} = useUserStore();

                if (isAdvisorOrGreater) {
                    return next();
                }

                next('/');
            },
        },
        {
            path: '/advisors',
            children: [
                {
                    path: '',
                    name: 'Advisors',
                    component: Advisors,
                },
                {
                    path: ':user_id/preferences',
                    name: 'AdminInvestmentPreferences',
                    component: InvestmentPreferences,
                },
            ],

            beforeEnter: (to, from, next) => {
                const {isSuper} = useUserStore();

                if (isSuper) {
                    return next();
                }

                next('/');
            },
        },
        {
            path: '/reset-password/:token',
            name: 'ResetPassword',
            component: ResetPassword,
        },
        {
            path: '/login',
            name: 'Login',
            component: Login,
        },
        {
            path: '/admin',
            name: 'Admin',
            component: Admin,
            beforeEnter: (to, from, next) => {
                const {isFirmAdminOrGreater} = useUserStore();

                if (isFirmAdminOrGreater) {
                    return next();
                }

                next('/');
            },
        },
        {
            path: '/billing',
            name: 'Billing',
            component: Billing,
            beforeEnter: (to, from, next) => {
                const {isFirmAdminOrGreater} = useUserStore();

                if (isFirmAdminOrGreater) {
                    return next();
                }

                next('/');
            },
        },
        {
            path: '/investment-preferences',
            name: 'InvestmentPreferences',
            component: InvestmentPreferences,
            beforeEnter: (to, from, next) => {
                const {isAdvisorOrGreater} = useUserStore();

                if (isAdvisorOrGreater) {
                    return next();
                }

                next('/');
            },
        },
        {
            path: '/settings',
            name: 'Settings',
            component: Settings,
        },
        {
            path: '/survey',
            name: 'Survey',
            component: Survey,
        },
        {
            path: '/clients/:user_id',
            children: [
                {
                    path: '',
                    name: 'Client',
                    component: Client,
                },
                {
                    path: 'accounts',
                    name: 'Accounts',
                    component: Accounts,
                },
            ],
            beforeEnter: (to, from, next) => {
                const {isAdvisorOrGreater} = useUserStore();

                if (isAdvisorOrGreater) {
                    return next();
                }

                next('/');
            },
        },
        {
            path: "/success",
            name: "Success",
            component: Success
        },
        {
            path: "/subscription-success",
            name: "SubSuccess",
            component: SubSuccess
        },
        {
            path: "/payment-info",
            name: "PaymentInfo",
            component: PaymentInfo
        },
        {
            path: "/failure",
            name: "Failure",
            component: Failure
        },
        {
            path: '/advisor-notice',
            name: 'AdvisorBlockedNotice',
            component: AdvisorBlocked, // Create this view
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
});


export default router;
