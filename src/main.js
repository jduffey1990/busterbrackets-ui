import 'vuetify/styles';
import App from './App.vue';
import {createApp} from 'vue';
import './assets/scss/misc.scss';
import axios from './plugins/axios';
import {createPinia} from 'pinia';
import router from './router';
import vuetify from './plugins/vuetify';
import {useUserStore} from './store/user';
import SubSuccess from "@/components/SubSuccess.vue";

const app = createApp(App);
const pinia = createPinia();

pinia.use(({store}) => {
    store.$axios = app.config.globalProperties.$axios;
});

app.use(axios).use(pinia).use(vuetify);

(async () => {
    // Initialize the user store and fetch session info
    const userStore = useUserStore();
    await userStore.getSession();

    // Define the router guard
    router.beforeEach((to, from, next) => {
        const {isLoggedIn} = userStore;

        if (isLoggedIn) {
            const unrestrictedRoutes = ['Login', 'ResetPassword', 'Billing', 'AdvisorBlockedNotice', 'Logout',
                "Success", "SubSuccess", "PaySuccess"];

            if (unrestrictedRoutes.includes(to.name)) {
                next();
                return;
            }

            const {stripeAccountAssociated, stripeIsCurrent, isFirmAdminOrGreater} = userStore;

            if (stripeAccountAssociated && stripeIsCurrent) {
                next(); // Allow navigation if subscription is current
            } else {
                if (isFirmAdminOrGreater) {
                    next({name: 'Billing'});
                } else {
                    next({name: 'AdvisorBlockedNotice'});
                }
            }
        } else {
            next(); // Allow access for non-auth routes
        }
    });

    // Apply router and mount app
    app.use(router).mount('#app');
})();
