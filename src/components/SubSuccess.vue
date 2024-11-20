<template>
  <div class="success-page">
    <div class="success-container">
      <h1 class="mb-4">Welcome to Pomarium!</h1>

      <p class="mt-6">
        Your subscription is now active though it may take a moment for
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
      router: null, // Store router reference
    };
  },
  mounted() {
    this.router = useRouter(); // Correctly initialize router within mounted lifecycle

    this.startAnimation();

    // Add a delay before starting the polling
    setTimeout(() => {
      this.checkStripeCustomerId(); // Start polling or watching the value after delay
    }, 4000); // 4-second delay for reading
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

      // Start polling the API for user data
      this.pollInterval = setInterval(async () => {
        try {
          await userStore.fetchUserData(); // Assuming fetchUserData updates the user object in the store
          const stripeCustomerId = userStore.user?.firm?.stripe_customer_id;

          if (stripeCustomerId) {
            clearInterval(this.pollInterval); // Stop polling when the condition is met
            await this.router.push("/payment-info"); // Redirect to the payment info page
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }, 2000); // Poll every 2 seconds
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: transparent;
  padding: 20px;
}

.success-container {
  text-align: center;
  max-width: 700px;
  background-color: rgba(255, 255, 255, 0.2); /* Slightly more opaque background for readability */
  padding: 40px;
  border-radius: 12px; /* Slightly larger border radius for a softer look */
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15); /* Enhanced shadow for depth */
  color: #07152A; /* Set a consistent text color */
}

.success-container h1 {
  font-size: 2.5rem; /* Larger font size for the heading */
  font-weight: 600; /* Slightly bold for emphasis */
  margin-bottom: 20px; /* Add spacing below the heading */
}

.success-container p {
  font-size: 1rem; /* Standard body font size */
  line-height: 1.6; /* Improved line height for readability */
  margin-top: 1.5rem; /* Consistent spacing above paragraphs */
  margin-bottom: 1rem; /* Add spacing below paragraphs */
  color: #333; /* Slightly darker text color for contrast */
}

.success-container hr {
  border: none;
  border-top: 2px solid #ddd; /* Subtle divider line */
  margin: 30px 0; /* Spacing around the divider */
}

.success-container h3 {
  font-size: 1.25rem; /* Slightly larger font size */
  font-weight: 500; /* Medium weight for balance */
  margin-top: 20px; /* Spacing above the text */
  color: #07152A; /* Consistent color with the theme */
}

.success-container span {
  color: #FCC35B; /* Accent color for the dots animation */
}
</style>

