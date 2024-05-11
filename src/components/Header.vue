<template>
  <v-app-bar fixed color="lightgrey" height="80">
    <v-container>
      <v-row>
        <v-app-bar-title>
          <router-link to="/" custom v-slot="{ navigate }">
            <v-img
              :width="200"
              src="@/assets/pomarium-logo-text-side.png"
              @click="navigate"
              class="cursor-pointer"
            ></v-img>
          </router-link>
        </v-app-bar-title>

        <v-spacer></v-spacer>

        <template v-if="isLoggedIn">
          <div class="mx-3">
            <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
              <v-btn
                @click="navigate"
                :class="{ 'font-weight-black': isActive }"
              >
                Dashboard
              </v-btn>
            </router-link>
          </div>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" class="text-disabled">
                {{ user.full_name || user.email }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-if="isFirmAdminOrGreater"
                link
                :to="{ name: 'Admin' }"
              >
                <v-list-item-title>Firm Admin </v-list-item-title>
              </v-list-item>

              <v-list-item link :to="{ name: 'AccountSettings' }">
                <v-list-item-title>Account Settings </v-list-item-title>
              </v-list-item>

              <v-list-item link :to="{ name: 'AdvisorPreferences' }">
                <v-list-item-title>Advisor Preferences </v-list-item-title>
              </v-list-item>

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
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const { user, isLoggedIn, isFirmAdminOrGreater } = storeToRefs(useUserStore());

const router = useRouter();

const logout = async () => {
  await useUserStore().logout();
  router.push({ name: 'Login' });
};
</script>
