<template>
  <div class="success-page">
    <div class="success-container">
      <h4>Update your card on file below</h4>
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
    </div>
  </div>
</template>
<script setup>
import {loadStripe} from '@stripe/stripe-js';
import {inject, onMounted, ref} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from "pinia";

const {stripeAccountAssociated} = useUserStore();
const {stripePublicKey} = storeToRefs(useUserStore())

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
      border: '4px',
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
    '.Tab:hover': {
      backgroundColor: '#FCC35B',
      color: '#fff',
    },
    '.Tab--selected': {
      boxShadow: '0px 0px 10px #FCC35B',
      color: '#07152A',
    },
    '.Tab--selected:hover': {
      backgroundColor: '#ECECEC',
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
        return_url: `${window.location.origin}/billing`,
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
      stripe = await loadStripe(stripePublicKey.value);
      elements = stripe.elements({
        clientSecret: clientSecret,
        appearance,
      });

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

.intent-button {
  background-color: var(--Primary-Dark, #07152A);
  color: #ffffff;
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

</style>