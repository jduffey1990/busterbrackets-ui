import {createRouter, createWebHistory} from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Home from '@/views/Home.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import {useUserStore} from '@/store/user';
import Billing from '@/views/Billing.vue';
import Settings from '@/views/Settings.vue';
import Failure from "@/components/Failure.vue";
import Success from "@/components/Success.vue";
import SubSuccess from "@/components/SubSuccess.vue";
import PaymentInfo from "@/components/PaymentInfo.vue";
import PaySuccess from "@/components/PaySuccess.vue";


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
                next('/dashboard')
            },
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
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
            path: '/settings',
            name: 'Settings',
            component: Settings,
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
            path: "/payment-processing",
            name: "PaySuccess",
            component: PaySuccess
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
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
});


export default router;
