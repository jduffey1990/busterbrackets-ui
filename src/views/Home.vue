<template>
  <div>
    <router-link to="/survey" custom v-slot="{ navigate, isActive }">
      <v-btn
        @click="navigate"
        role="link"
        :class="{ 'font-weight-black': isActive }"
      >
        Start Survey
      </v-btn>
    </router-link>
  </div>
</template>

<script setup></script>
