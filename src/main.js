import 'vuetify/styles';
import App from './App.vue';
import { createApp } from 'vue';
import './assets/scss/typography.scss';
import axios from './plugins/axios';
import { createPinia } from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import { loadFonts } from './plugins/webfontloader';

loadFonts();

const app = createApp(App);

const pinia = createPinia();
pinia.use(async ({ store }) => {
  store.$axios = app.config.globalProperties.$axios;
});

app.use(axios).use(pinia).use(router).use(vuetify);

app.mount('#app');
