import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/views/Login.vue';
import Survey from '@/views/Survey.vue';
import Dashboard from '@/views/Dashboard.vue';
import AdvisorPreferences from '@/views/AdvisorPreferences.vue';

import Client from '@/views/Client.vue';
import Home from '@/views/Home.vue';
import ResetPassword from '@/views/ResetPassword.vue';
import { useUserStore } from '@/store/user';
import Admin from '@/views/Admin.vue';
import Settings from '@/views/Settings.vue';
import Accounts from '@/views/Accounts.vue';

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
          return next('/login');
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
      path: '/admin',
      name: 'Admin',
      component: Admin,
      beforeEnter: (to, from, next) => {
        const { isFirmAdminOrGreater } = useUserStore();

        if (isFirmAdminOrGreater) {
          return next();
        }

        next('/');
      },
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
