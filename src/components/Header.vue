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

        <template v-if="useUserStore().isLoggedIn">
          <div class="mx-3">
            <router-link to="/" custom v-slot="{ navigate, isActive }">
              <v-btn
                @click="navigate"
                role="link"
                :class="{ 'font-weight-black': isActive }"
              >
                Dashboard
              </v-btn>
            </router-link>
          </div>

          <div class="mx-3">
            <router-link to="/survey" custom v-slot="{ navigate, isActive }">
              <v-btn
                @click="navigate"
                role="link"
                :class="{ 'font-weight-black': isActive }"
              >
                Survey
              </v-btn>
            </router-link>
          </div>

          <div class="mx-3">
            <router-link to="/portfolio" custom v-slot="{ navigate, isActive }">
              <v-btn
                @click="navigate"
                role="link"
                :class="{ 'font-weight-black': isActive }"
              >
                Portfolio
              </v-btn>
            </router-link>
          </div>

          <div class="mx-3">
            <router-link
              to="/performance"
              custom
              v-slot="{ navigate, isActive }"
            >
              <v-btn
                @click="navigate"
                role="link"
                :class="{ 'font-weight-black': isActive }"
              >
                Performance
              </v-btn>
            </router-link>
          </div>

          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" class="text-disabled">
                {{
                  useUserStore().getUser.full_name ||
                  useUserStore().getUser.email
                }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="router.push('/account')">
                <v-list-item-title>Account Settings</v-list-item-title>
              </v-list-item>
              <v-list-item @click="router.push('/advisor-preferences')">
                <v-list-item-title>Advisor Preferences</v-list-item-title>
              </v-list-item>
              <v-list-item @click="useUserStore().logout()">
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import router from '@/router';
import { useUserStore } from '@/store/user';
</script>
