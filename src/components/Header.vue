<template>
  <v-app-bar flat height="64" color="background" class="site-header">
    <div class="header-inner">
      <router-link to="/" class="brand">
        <img src="@/assets/buster-mark.png" alt="" class="brand-mark"/>
        <span class="brand-name">Buster Brackets</span>
      </router-link>

      <nav v-if="isLoggedIn" class="primary-nav">
        <router-link to="/dashboard" custom v-slot="{ navigate, isActive }">
          <a href="/dashboard" class="nav-link" :class="{ active: isActive }" @click.prevent="navigate">Dashboard</a>
        </router-link>
        <router-link to="/builder" custom v-slot="{ navigate, isActive }">
          <a href="/builder" class="nav-link" :class="{ active: isActive }" @click.prevent="navigate">Build</a>
        </router-link>
      </nav>

      <div class="header-right">
        <template v-if="isLoggedIn">
          <v-menu location="bottom end">
            <template v-slot:activator="{ props }">
              <button v-bind="props" type="button" class="avatar" :aria-label="`Account menu for ${displayName}`">
                {{ initials }}
              </button>
            </template>
            <v-list density="compact" min-width="200">
              <v-list-subheader>{{ displayName }}</v-list-subheader>
              <v-list-item :to="{ name: 'Dashboard' }" class="menu-mobile-only">
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Builder' }" class="menu-mobile-only">
                <v-list-item-title>Build a bracket</v-list-item-title>
              </v-list-item>
              <v-list-item :to="{ name: 'Settings' }">
                <v-list-item-title>Settings</v-list-item-title>
              </v-list-item>
              <v-list-item v-if="isAdmin" :to="{ name: 'Admin' }">
                <v-list-item-title>Tournament admin</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1"></v-divider>
              <v-list-item @click="logout()">
                <v-list-item-title>Log out</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>

        <template v-else>
          <router-link to="/login" custom v-slot="{ navigate }">
            <v-btn variant="outlined" color="secondary" size="small" @click="navigate">Log in</v-btn>
          </router-link>
        </template>
      </div>
    </div>
  </v-app-bar>
</template>

<script setup>
import {computed} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from 'pinia';
import {useRouter} from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const {user, isLoggedIn, isAdmin} = storeToRefs(userStore);

const displayName = computed(() => user.value.name || user.value.email || '');

const initials = computed(() => {
  const name = user.value.name || '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (user.value.email || '?').slice(0, 2).toUpperCase();
});

const logout = async () => {
  await userStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.site-header {
  border-bottom: 1px solid var(--bb-line);
}

.header-inner {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 28px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--bb-paper);
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: block;
  object-fit: cover;
}

.brand-name {
  font-family: var(--bb-font-display);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  white-space: nowrap;
}

.primary-nav {
  display: flex;
  gap: 4px;
}

.nav-link {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bb-muted);
  text-decoration: none;
}

.nav-link:hover {
  color: var(--bb-paper);
}

.nav-link.active {
  color: var(--bb-paper);
  font-weight: 600;
  background: rgba(255, 255, 255, 0.08);
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--bb-line-strong);
  background: var(--bb-raised);
  color: var(--bb-paper);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.menu-mobile-only {
  display: none;
}

@media (min-width: 960px) {
  .header-inner {
    padding: 0 24px;
  }
}

@media (max-width: 700px) {
  .primary-nav {
    display: none;
  }

  .menu-mobile-only {
    display: flex;
  }
}
</style>
