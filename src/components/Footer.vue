<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <span class="footer-text">{{ new Date().getFullYear() }} Buster Brackets</span>
      <span class="footer-text">
        Predictions are for entertainment only.
        <button type="button" class="footer-link" @click="showDisclaimer = true">Read the full disclaimer</button>
      </span>
    </div>

    <v-dialog v-model="showDisclaimer" max-width="560">
      <v-card>
        <v-card-title>Disclaimer</v-card-title>
        <v-card-text>
          <p class="mb-0">
            All predictions, projections, and suggestions provided on this website are for entertainment purposes only.
            We do not guarantee the accuracy or outcome of any bracket, and we cannot be held liable for any financial losses, wagering issues, or other damages incurred by following these picks or strategies.
            By using Buster Brackets, you acknowledge that all final decisions are your own and agree to hold Buster Brackets and its creators harmless for any results or consequences thereof.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showDisclaimer = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </footer>
</template>

<script setup>
import { ref } from 'vue';

const showDisclaimer = ref(false);
</script>

<style scoped>
.site-footer {
  border-top: 1px solid var(--bb-line);
}

.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px 16px;
}

.footer-link {
  background: none;
  border: 0;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--bb-ball);
  cursor: pointer;
}

.footer-link:hover {
  color: var(--bb-gold);
}

@media (min-width: 960px) {
  .footer-inner {
    padding: 16px 24px;
  }
}
</style>
