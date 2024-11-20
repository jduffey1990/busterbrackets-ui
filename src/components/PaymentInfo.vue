<template>
  <h4>Please add your payment info now to prevent access speedbumps later.</h4>
  <form id="setup-form" @submit.prevent="handleSetupSubmit">
    <!-- Optional: Link Authentication Element -->
    <div id="payment-element" class="mb-5"></div>
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

  <h2 class="mt-6">What Happens Next?</h2>
  <ul class="next-steps">
    <li>Start by adding any advisors that need access in your <a href="/admin" target="_blank">firm admin page</a>.
    </li>
    <li>Manage clients in your <a href="/dashboard" target="_blank">dashboard</a>.
    </li>
    <li>Ensure that your account and payment information remain up-to-date to enjoy uninterrupted service on your
      <a href="/billing" target="_blank">billing page</a>. Though it may take a minute or two for the subscription to be
      live.
    </li>
  </ul>

  <div class="contact-info">
    <h3>Need Help?</h3>
    <p>Our support team is here to assist you with any questions or concerns. You can reach us at:</p>
    <p><a href="https://www.getpomarium.com/product/resources" target="_blank">Pomarium Support</a></p>
  </div>
</template>
<script>
import {loadStripe} from '@stripe/stripe-js';
import {inject, onMounted, ref} from 'vue';
import {useUserStore} from '@/store/user';

const {stripeAccountAssociated} = useUserStore();

const $axios = inject('$axios');

const setupBtnDisabled = ref(false);
const stateClient = ref({});
let stripe;
let elements;

const appearance = {
  theme: 'stripe',
  variables: {
    borderRadius: '6px',
  },
  rules: {
    '.Input': {
      boxShadow: 'inset 0 0 0 1px #07152A',
      padding: '0.75em 1em',
      color: '#07152A',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    '.Input:focus': {
      boxShadow: 'inset 0 0 0 2px #FCC35B',
    },
    '.Input:hover': {
      boxShadow: 'inset 0 0 0 1px #FCC35B',
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    '.Button': {
      alignItems: 'center'
    },
    '.Tab': {
      padding: '10px 20px',
      margin: '15px 5px',
      borderRadius: '50px',
      borderColor: '#07152A',
      fontWeight: '500',
      fontSize: '16px',
      textTransform: 'uppercase',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      fontFamily: '"halyard-text" !important',
    },
    '.Tab--selected': {
      boxShadow: '0px 0px 4px #FCC35B',
      color: '#FCC35B',
    },
    '.Tab--selected:hover': {
      backgroundColor: '#FCC35B',
      color: '#fff',
    },
  },
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
  if (!stripeAccountAssociated) {
    setTimeout(() => {
          window.location.reload()
        }, 500
    )
  } else {
    try {
      // Request a SetupIntent from the backend
      const response = await $axios.post("/api/billing/create-setup-intent/");
      const {client_secret: clientSecret} = response.data;

      if (!clientSecret) {
        throw new Error("SetupIntent client secret not received.");
      }

      stateClient.value = {clientSecret};

      // Initialize Stripe elements
      stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);
      elements = stripe.elements({
        clientSecret: clientSecret,
        appearance,
      });

      console.log("here are elements", elements)

      const paymentElement = elements.create('payment', {
        layout: 'tabs', // Optional layout customization
      });
      paymentElement.mount('#payment-element');
      console.log('Stripe Elements initialized successfully');
    } catch (err) {
      console.error("Error fetching SetupIntent:", err);
      alert("An error occurred while fetching the SetupIntent.");
    }
  }
});
</script>

<style scoped>
.intent-button {
  background-color: #07152A;
  color: #ffffff;
  font-family: "halyard-text" !important;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 16px;
}
</style>