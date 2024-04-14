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

app.use(axios).use(pinia).use(router).use(vuetify);

(async () => {
  await useUserStore().getSession();

  const loginName = 'Login';

  if (!useUserStore().isLoggedIn) {
    router.push({
      name: loginName,
    });
  } else {
    if (router.currentRoute.value.name === loginName) {
      router.push({
        name: 'Dashboard',
      });
    }
  }

  router.beforeEach(async (to, from) => {
    if (!useUserStore().isLoggedIn && to.name !== loginName) {
      return {
        name: loginName,
      };
    }
  });

  app.mount('#app');
})();
