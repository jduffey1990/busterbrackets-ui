import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Survey from '@/views/Survey.vue';
import Dashboard from '@/views/Dashboard.vue';
import AdvisorPreferences from '@/views/AdvisorPreferences.vue';
import Account from '@/views/Account.vue';
import Client from '@/views/Client.vue';
import Home from '@/views/Home.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import { useUserStore } from '@/store/user';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
      beforeEnter: (to, from, next) => {
        const { isLoggedIn } = useUserStore();

        if (!isLoggedIn) {
          return next('/survey');
        }

        next('/dashboard');
      },
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      beforeEnter: (to, from, next) => {
        const { isAdvisorOrGreater } = useUserStore();

        if (isAdvisorOrGreater) {
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
      path: '/advisor-preferences',
      name: 'AdvisorPreferences',
      component: AdvisorPreferences,
      beforeEnter: (to, from, next) => {
        const { isAdvisorOrGreater } = useUserStore();

        if (isAdvisorOrGreater) {
          return next();
        }

        next('/');
      },
    },
    {
      path: '/account',
      name: 'Account',
      component: Account,
    },
    {
      path: '/survey',
      name: 'Survey',
      component: Survey,
    },
    {
      path: '/clients/:user_uuid',
      children: [
        {
          path: '',
          name: 'Client',
          component: Client,
        },
      ],
      beforeEnter: (to, from, next) => {
        const { isAdvisorOrGreater } = useUserStore();

        if (isAdvisorOrGreater) {
          return next();
        }

        next('/');
      },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

export default router;
