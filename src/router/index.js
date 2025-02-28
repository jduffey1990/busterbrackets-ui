import {createRouter, createWebHistory} from 'vue-router';
import Login from '@/views/Login.vue';
import Dashboard from '@/views/Dashboard.vue';
import Home from '@/views/Home.vue';
import {useUserStore} from '@/store/user';
import Settings from '@/views/Settings.vue';
import Success from "@/components/Success.vue";


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
            path: '/login',
            name: 'Login',
            component: Login,
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
            path: '/:pathMatch(.*)*',
            redirect: '/',
        },
    ],
});


export default router;
