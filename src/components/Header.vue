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
                {{ useUserStore().getUser.email }}
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="router.push('/survey')">
                <v-list-item-title>Account Settings</v-list-item-title>
              </v-list-item>
              <v-list-item @click="router.push('/survey')">
                <v-list-item-title>Advisor Preferences</v-list-item-title>
              </v-list-item>
              <v-list-item @click="useUserStore().logout()">
                <v-list-item-title>Logout</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <!-- <v-btn @click="useUserStore().logout()"
            ><span class="text-disabled mx-2"
              >{{ useUserStore().getUser.email }}
            </span>
            (Logout)
          </v-btn> -->
        </template>

        <div class="mx-3">
          <!-- <router-link
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
              Login
            </v-btn>
          </router-link> -->
        </div>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import router from '@/router';
import { useUserStore } from '@/store/user';
</script>
