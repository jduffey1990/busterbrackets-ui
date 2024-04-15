import 'vuetify/styles';
import App from './App.vue';
import { createApp } from 'vue';
import './assets/scss/typography.scss';
import axios from './plugins/axios';
import { createPinia } from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';
import { useUserStore } from './store/user';

loadFonts();

const app = createApp(App);

const pinia = createPinia();
pinia.use(async ({ store }) => {
  store.$axios = app.config.globalProperties.$axios;
});

app.use(axios).use(pinia).use(vuetify);

(async () => {
  await useUserStore().getSession();

  const loginPath = '/login';

  if (!useUserStore().isLoggedIn) {
    router.push(loginPath);
  } else {
    if (router.currentRoute.value.path === loginPath) {
      router.push('/');
    }
  }

  router.beforeEach((to) => {
    if (!useUserStore().isLoggedIn && to.path !== loginPath) {
      return loginPath;
    }
  });

  app.use(router).mount('#app');
})();
