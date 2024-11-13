<template>
  <v-app-bar fixed :style="appBarStyle" :elevation="0" height="60">
    <v-container>
      <div class="nav_bar">
        <v-app-bar-title>
          <router-link to="/" custom v-slot="{ navigate }">
            <v-img v-if="onSurvey && goodLogo"
                   :width="166"
                   :src="logos.firm_logo"
                   @click="navigate"
                   class="cursor-pointer"
                   style="max-height: 35px;"
            ></v-img>
            <v-img v-else
                   :width="166"
                   src="@/assets/pomarium.svg"
                   @click="navigate"
                   class="cursor-pointer"
                   style="max-height: 35px;"
            ></v-img>

          </router-link>
        </v-app-bar-title>

        <div class="nav-bar-mobile">
          <v-spacer></v-spacer>
          <template v-if="isLoggedIn">

            <div class="mx-3 hide">
              <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
                <v-btn
                    @click="navigate"
                    :class="{ 'font-weight-black': isActive }"
                >
                  Dashboard
                </v-btn>
              </router-link>
            </div>

            <v-menu :elevation="0">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" class="text-disabled">
                  {{ user.full_name || user.email }} ({{
                    user.role.replace('_', ' ')
                  }})
                </v-btn>
              </template>
              <v-list :elevation="0">
                <v-list-item v-if="isSuper" link :to="{ name: 'Advisors' }">
                  <v-list-item-title>Super Tools</v-list-item-title>
                </v-list-item>

                <v-list-item
                    v-if="isFirmAdminOrGreater"
                    link
                    :to="{ name: 'Admin' }"
                >
                  <v-list-item-title>Admin</v-list-item-title>
                </v-list-item>

                <v-list-item
                    v-if="isFirmAdminOrGreater"
                    link
                    :to="{ name: 'Billing' }"
                >
                  <v-list-item-title>Billing</v-list-item-title>
                </v-list-item>

                <v-list-item link :to="{ name: 'Settings' }">
                  <v-list-item-title>Settings</v-list-item-title>
                </v-list-item>

                  <v-list-item
                      link
                      href="https://pomarium.atlassian.net/wiki/spaces/CS/overview"
                      target="_blank"
                  >
                    <v-list-item-title>Resources</v-list-item-title>
                  </v-list-item>
                  <hr/>
                  <v-list-item @click="logout()">
                    <v-list-item-title>Logout</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
          
                <v-list-item
                    link
                    href="https://pomarium.atlassian.net/wiki/spaces/CS/overview"
                >
                  <v-list-item-title>Resources</v-list-item-title>
                </v-list-item>
                <hr/>
                <v-list-item @click="logout()">
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>

          </template>


          <template v-else>
            <div class="mx-3">
              <router-link to="/login" custom v-slot="{ navigate, isActive }">
                <v-btn
                    @click="navigate"
                    role="link"
                    :class="{ 'font-weight-black': isActive }"
                >
                  Log In
                </v-btn>
              </router-link>
            </div>
          </template>
        </div>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import {ref, onMounted, onUnmounted, computed, inject, watch} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {useRouter} from 'vue-router';
import {useRoute} from 'vue-router';

const router = useRouter();
const $axios = inject('$axios');

const {user, isLoggedIn, isFirmAdminOrGreater, isSuper} = storeToRefs(
    useUserStore()
);

const logout = async () => {
  await useUserStore().logout();
  router.push('/login');
};

const scrollPosition = ref(0);
const opacity = ref(0);

const handleScroll = () => {
  scrollPosition.value = window.scrollY;
  opacity.value = scrollPosition.value > 0 ? 0.95 : 0;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

const appBarStyle = computed(() => {
  return {
    backgroundColor: `rgba(255, 255, 255, ${opacity.value})`,
  };
});

const logos = ref({});
const goodLogo = ref(false);
const getFirmLogo = async () => {
  try {
    const response = await $axios.get(`/api/firms/${user.value.firm.id}/logo/`);
    logos.value = response.data;
    logos.value['firm_logo'].includes('media') || logos.value['firm_logo'].includes('storage') ? goodLogo.value = true : goodLogo.value = false;
  } catch (error) {
    console.error('Error fetching firm logo:', error);
  }
};

onMounted(() => {
  getFirmLogo();
});

const onSurvey = ref(false);
//check if url contains survey every time the route changes
const checkSurvey = () => {
  if (window.location.href.includes('survey')) {
    onSurvey.value = true;
  } else {
    onSurvey.value = false;
  }
};

const route = useRoute();

onMounted(() => {
  checkSurvey();
});

watch(route, () => {
  checkSurvey();
});
</script>


<style>
.nav_bar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.nav-bar-mobile {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

@media only screen and (max-width: 700px) {
  .nav-bar-mobile {
    display: flex;
    align-items: center;
  }

  .v-toolbar__content {
    min-height: 150px;
  }

  .hide {
    display: none;
  }
}
</style>
