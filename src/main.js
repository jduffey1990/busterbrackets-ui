import 'vuetify/styles';
import App from './App.vue';
import {createApp} from 'vue';
import './assets/scss/misc.scss';
import axios from './plugins/axios';
import {createPinia} from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import {useUserStore} from './store/user';

const app = createApp(App);
const pinia = createPinia();

pinia.use(({store}) => {
    store.$users = app.config.globalProperties.$usersApi;
    store.$brackets =  app.config.globalProperties.$bracketsApi;
});

app.use(axios).use(pinia).use(vuetify);

(async () => {
    // Initialize the user store and fetch session info
    const userStore = useUserStore();
    await userStore.getSession();

    // Apply router and mount app
    app.use(router).mount('#app');
})();
