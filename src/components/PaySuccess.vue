<template>
  <div class="success-page">
    <div class="success-container">
      <h1 class="mb-4">Thanks for your payment!</h1>

      <p class="mt-6">
        Your payment is processing with stripe. It may take a few moments for them to update us on the successful
        payment.
      </p>
      <hr>
      <h3>Loading<span>{{ dots }}</span></h3>
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
      timeoutId: null, // Store timeout ID for cleanup
      router: null, // Store router reference
      subEnd: null, // State variable to hold the initial subscription end date
    };
  },
  mounted() {
    this.router = useRouter(); // Correctly initialize router within mounted lifecycle

    this.startAnimation();

    this.initializeSubscriptionCheck(); // Start the subscription check
  },
  methods: {
    startAnimation() {
      let count = 0;
      setInterval(() => {
        count = (count + 1) % 4; // Cycle through 0, 1, 2, 3
        this.dots = ".".repeat(count); // Update dots
      }, 400); // Adjust timing for the desired animation speed
    },
    async fetchInitialSubscriptionData() {
      const userStore = useUserStore();
      try {
        await userStore.fetchUserData(); // Assuming fetchUserData updates the user object in the store
        this.subEnd = userStore.user?.firm?.subscription_end_date; // Save the initial subscription end date
      } catch (error) {
        console.error("Error fetching initial subscription data:", error);
      }
    },
    async pollSubscriptionData() {
      const userStore = useUserStore();

      this.pollInterval = setInterval(async () => {
        try {
          await userStore.fetchUserData(); // Fetch the latest user data
          const innerSubEnd = userStore.user?.firm?.subscription_end_date;

          if (innerSubEnd !== this.subEnd) {
            clearInterval(this.pollInterval); // Stop polling when the subscription end date changes
            clearTimeout(this.timeoutId); // Clear timeout to avoid double navigation
            await this.router.push("/success"); // Navigate to success
          }
        } catch (error) {
          console.error("Error polling subscription data:", error);
        }
      }, 2000); // Poll every 2 seconds
    },
    async initializeSubscriptionCheck() {
      await this.fetchInitialSubscriptionData(); // Fetch the initial subscription data
      this.pollSubscriptionData(); // Start polling for updates

      // Set a timeout to redirect after 10 seconds if polling doesn't succeed
      this.timeoutId = setTimeout(async () => {
        clearInterval(this.pollInterval); // Stop polling if timeout occurs
        console.warn("Timeout reached, redirecting to success...");
        await this.router.push("/success"); // Navigate to success
      }, 20000); // 10-second timeout
    },
  },
  beforeUnmount() {
    // Clear interval and timeout on component unmount to avoid memory leaks
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  },
};
</script>


<style scoped>
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

