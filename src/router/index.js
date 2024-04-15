import { createRouter, createWebHistory } from 'vue-router';
import Register from '@/views/Register.vue';
import Login from '@/views/Login.vue';
import Survey from '@/views/Survey.vue';
import Portfolio from '@/views/Portfolio.vue';
import Performance from '@/views/Performance.vue';
import Dashboard from '@/views/Dashboard.vue';
import AdvisorPreferences from '@/views/AdvisorPreferences.vue';
import Account from '@/views/Account.vue';
import Client from '@/views/Client.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    // {
    //   path: '/register',
    //   name: 'Register',
    //   component: Register,
    // },
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    // {
    //   path: '/portfolio',
    //   name: 'Portfolio',
    //   component: Portfolio,
    // },
    // {
    //   path: '/performance',
    //   name: 'Performance',
    //   component: Performance,
    // },
    {
      path: '/advisor-preferences',
      name: 'AdvisorPreferences',
      component: AdvisorPreferences,
    },
    {
      path: '/account',
      name: 'Account',
      component: Account,
    },
    {
      path: '/clients/:uuid',
      children: [
        {
          path: '',
          name: 'Client',
          component: Client,
        },
        {
          path: 'survey',
          name: 'Survey',
          component: Survey,
        },
      ],
    },
  ],
});

export default router;
