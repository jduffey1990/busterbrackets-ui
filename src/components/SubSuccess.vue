<template>
  <div class="success-page">
    <div class="success-container">
      <h1 class="mb-4">Welcome to Pomarium!</h1>

      <p class="mt-6">
        Your subscription is now active though it may take a couple of minutes for
        Stripe to process, and we're excited to support you on this journey. Your account has been set up with all the
        tools and resources you need to get started.
      </p>
      <hr>
      <h3>Your setup page is loading<span>{{ dots }}</span></h3>
    </div>
  </div>
</template>

<script>
import {useUserStore} from "@/store/user";
import {useRouter} from "vue-router";

export default {
  data() {
    return {
      dots: "",
      pollInterval: null,
    };
  },
  mounted() {
    this.startAnimation();
    this.checkStripeCustomerId(); // Start polling or watching the value
  },
  methods: {
    startAnimation() {
      let count = 0;
      setInterval(() => {
        count = (count + 1) % 4; // Cycle through 0, 1, 2, 3
        this.dots = ".".repeat(count); // Update dots
      }, 400); // Adjust timing for the desired animation speed
    },
    async checkStripeCustomerId() {
      const userStore = useUserStore();
      const router = useRouter();

      // Start polling the API for user data
      this.pollInterval = setInterval(async () => {
        await userStore.fetchUserData(); // Assuming fetchUserData updates the user object in the store
        const {stripe_customer_id} = userStore.user.firm.stripe_customer_id || {};

        if (stripe_customer_id) {
          clearInterval(this.pollInterval); // Stop polling when the condition is met
          router.push("/payment-info"); // Redirect to the payment info page
        }
      }, 1000); // Poll every 5 seconds
    },
  },
  beforeUnmount() {
    // Clear interval on component unmount to avoid memory leaks
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  },
};
</script>

<style>
.success-page {
  text-align: center;
  margin-top: 50px;
}
</style>
