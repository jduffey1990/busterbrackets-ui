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

        <div class="mx-3">
          <router-link to="/survey" custom v-slot="{ navigate, isActive }">
            <v-btn
              @click="navigate"
              role="link"
              :disabled="!useUserStore().isLoggedIn"
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
              :disabled="!useUserStore().isLoggedIn"
              :class="{ 'font-weight-black': isActive }"
            >
              Portfolio
            </v-btn>
          </router-link>
        </div>

        <div class="mx-3">
          <router-link to="/performance" custom v-slot="{ navigate, isActive }">
            <v-btn
              @click="navigate"
              role="link"
              :disabled="!useUserStore().isLoggedIn"
              :class="{ 'font-weight-black': isActive }"
            >
              Performance
            </v-btn>
          </router-link>
        </div>

        <div class="mx-3">
          <router-link
            v-if="!useUserStore().isLoggedIn"
            to="/login"
            custom
            v-slot="{ navigate, isActive }"
          >
            <v-btn
              @click="navigate"
              role="link"
              :class="{ 'font-weight-black': isActive }"
            >
              Login/Register
            </v-btn>
          </router-link>
          <template v-else>
            <v-btn disabled>{{ useUserStore().getUser.email }}</v-btn>
            <v-btn @click="useUserStore().logout()">Logout</v-btn>
          </template>
        </div>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { useUserStore } from '@/store/user';
</script>
