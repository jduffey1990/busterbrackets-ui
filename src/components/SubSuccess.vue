<template>
  <div class="success-page">
    <div class="success-container">
      <h1 class="mb-4">Welcome to Pomarium!</h1>
      <p>Please add your payment info now to prevent access speedbumps later.</p>
      <form id="setup-form" @submit.prevent="handleSetupSubmit">
        <!-- Optional: Link Authentication Element -->
        <div id="link-authentication-element"/>
        <div id="payment-element"/>
        <button
            id="submit"
            :disabled="setupBtnDisabled"
            class="intent-button"
        >
          Save Payment Info
        </button>

        <!-- Display messages -->
        <sr-messages :messages="messages"/>
      </form>
      <p>
        Thank you for choosing Pomarium! Your subscription is now active though it may take a couple of minutes for
        Stripe to process, and we're excited to support you on this journey. Your account has been set up with all the
        tools and resources you need to get started.
      </p>

      <h2>What Happens Next?</h2>
      <ul class="next-steps">
        <li>Start by adding any advisors that need access in your <a href="/admin">firm admin page</a>.
        </li>
        <li>Manage clients in your <a href="/dashboard">dashboard</a>.
        </li>
        <li>Ensure that your account and payment information remain up-to-date to enjoy uninterrupted service on your
          <a href="/billing">billing page</a>. Though it may take a minute or two for the subscription to be live.
        </li>
      </ul>

      <div class="contact-info">
        <h3>Need Help?</h3>
        <p>Our support team is here to assist you with any questions or concerns. You can reach us at:</p>
        <p><a href="https://www.getpomarium.com/product/resources" target="_blank">Pomarium Support</a></p>
      </div>

      <div class="button-container">
        <a href="/dashboard" class="primary-button">Go to Dashboard</a>
        <a href="/admin" class="secondary-button">Visit Admin Page</a>
      </div>
    </div>
  </div>
</template>

<script setup>
import {loadStripe} from '@stripe/stripe-js';
import {inject, onMounted, ref} from 'vue';
import {useUserStore} from '@/store/user';

const {stripeAccountAssociated} = useUserStore();

const $axios = inject('$axios');

const setupBtnDisabled = ref(false);
const stateClient = ref({});
let stripe;
let elements;

const loadStripeElements = async (clientSecret) => {
  try {
    if (!stripe) {
      stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);
    }

    elements = stripe.elements();

    // Create and mount payment element
    const paymentElement = elements.create("payment", {
      clientSecret, // Pass the clientSecret for setup intent
    });
    paymentElement.mount("#payment-element");

    // Create and mount link authentication element (optional)
    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");
  } catch (err) {
    console.error("Error initializing Stripe elements:", err);
    alert("An error occurred while setting up Stripe elements.");
  }
};

const handleSetupSubmit = async () => {
  setupBtnDisabled.value = true;

  try {
    if (!stateClient.value.clientSecret) {
      throw new Error("SetupIntent client secret is missing.");
    }

    // Confirm the SetupIntent
    const {setupIntent, error} = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      console.error("SetupIntent error:", error.message);
      alert("Error setting up payment method: " + error.message);
    } else {
      console.log("SetupIntent successful:", setupIntent);
      alert("Payment method added successfully!");
    }
  } catch (err) {
    console.error("Error handling SetupIntent:", err);
    alert("An error occurred while setting up your payment method.");
  } finally {
    setupBtnDisabled.value = false;
  }
};

onMounted(async () => {
  if (stripeAccountAssociated) {
    try {
      // Request a SetupIntent from the backend
      const response = await $axios.post("/api/billing/create-setup-intent/");
      const {client_secret: clientSecret} = response.data;

      if (!clientSecret) {
        throw new Error("SetupIntent client secret not received.");
      }

      stateClient.value = {clientSecret};

      // Initialize Stripe elements
      await loadStripeElements(clientSecret);
    } catch (err) {
      console.error("Error fetching SetupIntent:", err);
      alert("An error occurred while fetching the SetupIntent.");
    }
  }
});
</script>


<style scoped lang="scss">
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
  background: rgba(255, 255, 255, 0.2);
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: var(--Primary-Dark, #07152A);
  font-family: "halyard-display" !important;
  font-size: 58px;
  font-weight: 400;
  line-height: 110%;
  margin-bottom: 20px;
}

p {
  color: var(--Primary-Dark, #07152A);
  font-family: "halyard-text" !important;
  font-size: 20px;
  font-weight: 300;
  line-height: 130%;
  margin-bottom: 20px;
}

h2 {
  color: var(--Primary-Dark, #07152A);
  font-family: "halyard-display" !important;
  font-size: 46px;
  font-weight: 400;
  line-height: 110%;
  margin-top: 30px;
  margin-bottom: 15px;
}

h3 {
  color: var(--Primary-Dark, #07152A);
  font-family: "halyard-display" !important;
  font-size: 38px;
  font-weight: 400;
  line-height: 120%;
  margin-top: 40px;
  margin-bottom: 15px;
}

.next-steps {
  text-align: left;
  padding-left: 20px;
  margin: 20px 0;
  font-size: 20px;
  font-family: "halyard-text" !important;
  color: var(--Primary-Dark, #07152A);
}

.next-steps li {
  line-height: 130%;
  margin-bottom: 10px;
}

.contact-info p, .contact-info a {
  font-size: 20px;
  font-family: "halyard-text" !important;
  color: var(--Primary-Dark, #07152A);
}

.primary-button,
.secondary-button {
  display: inline-block;
  padding: 10px 20px;
  margin: 15px 5px;
  border-radius: 50px;
  font-weight: 500;
  font-size: 16px;
  text-transform: uppercase;
  text-decoration: none;
  font-family: "halyard-text" !important;
}

.primary-button {
  background-color: var(--Primary-Dark, #07152A);
  color: #ffffff;
}

.primary-button:hover {
  background-color: #005bb5;
}

.secondary-button {
  background-color: #ffffff;
  border: 2px solid #07152A;
  color: #07152A;
}

.secondary-button:hover {
  background-color: #eef7ff;
}
</style>
