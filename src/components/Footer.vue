<template>
  <v-footer class="text-center d-flex flex-column" color="translucent">
    <v-container>
      <v-row align="center" justify="center">
        <v-btn variant="text" color="primary" @click="showTerms = true">
          Terms & Conditions
        </v-btn>

        <v-dialog v-model="showTerms" max-width="600px">
          <v-card>
            <v-card-title>
              Terms & Conditions
            </v-card-title>
            <v-card-text>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
              velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="primary" text @click="showTerms = false">
                Close
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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


<script>
export default {
  data() {
    return {
      showTerms: false,
    };
  },
};
</script>

<style scoped>
.v-footer {
  max-height: 60px;
  background-color: rgba(255, 255, 255, 0.5) !important;
  padding: 0px 16px;
}

@media only screen and (max-width: 700px) {
  .v-footer {
    display: flex;
    flex-direction: column;

  }
}
</style>

</style>