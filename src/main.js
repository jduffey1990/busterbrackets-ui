import 'vuetify/styles';
import App from './App.vue';
import { createApp } from 'vue';
import './assets/scss/misc.scss';
import axios from './plugins/axios';
import { createPinia } from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import { useUserStore } from './store/user';

const app = createApp(App);

const pinia = createPinia();
pinia.use(async ({ store }) => {
  store.$axios = app.config.globalProperties.$axios;
});

app.use(axios).use(pinia).use(vuetify);

(async () => {
  await useUserStore().getSession();

  // const loginPath = '/login';

  // router.beforeEach((to) => {
  //   if (to.path !== loginPath && !useUserStore().isLoggedIn) {
  //     return loginPath;
  //   }

  //   if (to.path === loginPath && useUserStore().isLoggedIn) {
  //     return '/';
  //   }
  // });

  app.use(router).mount('#app');
})();
