<template>
  <v-footer class="text-center d-flex flex-column" color="lightgrey">
    <v-container>
      <v-row align="center" justify="center">

        <v-btn variant="text" color="primary">
          Disclosures
          <v-overlay
              activator="parent"
              class="ty"
              location-strategy="connected"
              location="top center"
              origin="bottom center"

          >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
            laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
            sunt in culpa qui officia deserunt mollit anim id est laborum.
          </v-overlay>
        </v-btn>
        <v-btn
            href="https://www.linkedin.com/company/getpomarium"
            target="_blank"
            rel="noopener noreferrer"
            icon="mdi-linkedin"
            class="mx-4"
            color="primary"
            variant="text"
        ></v-btn>
        {{ new Date().getFullYear() }} — <strong>Pomarium</strong>

      </v-row>
    </v-container>
  </v-footer>
</template>

<style scoped>
.v-footer {
  max-height: 80px;
}

</style>
<script setup>
</script>