<template>
    <div class="success-page">
      <div class="success-container">
        <h4 class="mb-4">Payment Information</h4>
        <p>By paying here, you will buy yourself 4 bracket credits.</p>
  
        <form
            id="payment-form"
            @submit.prevent="handleSubmit"
        >
          <div id="link-authentication-element"/>
          <div id="payment-element"/>
          <div>
            <button
                id="submit"
                class="intent-button mt-4"
                :disabled="isPaymentButtonDisabled || isLoading"
            >
              Pay $0.99
            </button>
            <sr-messages :messages="messages" class="small"/>
          </div>
        </form>
      </div>
    </div>
  </template>
  <script setup>
  import {loadStripe} from '@stripe/stripe-js';
  import {inject, onMounted, ref} from 'vue';
  import {useUserStore} from '@/store/user';
  import {storeToRefs} from "pinia";
  import SrMessages from "@/components/SrMessages.vue";
  
  const stripePublicKey = import.meta.env.VITE_STRIPE_PUB_KEY

  const $users = inject('$usersApi');
  
  const isPaymentButtonDisabled = ref(false);
  const isLoading = ref(false)
  const stateClient = ref({});
  let stripe;
  let elements;
  const messages = ref([]);
  
  // Mirrors the arena tokens in assets/scss/misc.scss; Stripe renders in
  // its own iframe, so it cannot read the CSS custom properties.
  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#FF6801',
      colorBackground: '#1B2F52',
      colorText: '#F4F1EA',
      colorTextSecondary: '#9FB0C8',
      colorDanger: '#FF6B6B',
      fontFamily: 'Inter, "Helvetica Neue", Arial, sans-serif',
      borderRadius: '8px',
    },
  };
  
  async function handleSubmit(event) {
  isPaymentButtonDisabled.value = true
  if (isLoading.value) return;
  isLoading.value = true;

  await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/success`,
    }
  })
      .then(function (result) {
        if (result.error) {
          messages.value.push(result.error.message);
        }
      });

  isPaymentButtonDisabled.value = false
  isLoading.value = false
}

async function getPaymentIntent() {
  try {
    isLoading.value = true;
    // Because your server route is GET /create-payment-intent
    const response = await $users.get("/create-payment-intent");

    // The server returns { clientSecret: '...' }
    const { clientSecret } = response.data;
    if (!clientSecret) {
      messages.value.push("No clientSecret found in response.");
      return;
    }

    // 3) Create Stripe elements using the returned clientSecret
    elements = stripe.elements({ 
      clientSecret: clientSecret,
      appearance
     });

    // 4) Create & mount the payment element
    const paymentElement = elements.create("payment",
      {layout: "tabs"}
    );
    paymentElement.mount("#payment-element");

    // 5) Create & mount the link authentication element
    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

  } catch (error) {
    console.error("Error fetching payment intent:", error);
    messages.value.push("An error occurred while fetching the payment intent.");
  } finally {
    isLoading.value = false;
  }
}

  
  
onMounted(async () => {
  try {
    stripe = await loadStripe(stripePublicKey);
    await getPaymentIntent();
  } catch (error) {
    console.error("Error loading Stripe or fetching Payment Intent:", error);
    messages.value.push("Error loading Stripe or fetching Payment Intent.");
  }
});
  
  
  </script>
  
  <style scoped>
.success-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.success-container {
  text-align: center;
  width: 100%;
  max-width: 560px;
  background: var(--bb-surface);
  border: 1px solid var(--bb-line);
  padding: 32px;
  border-radius: 8px;
}

.intent-button {
  background-color: var(--bb-ball);
  color: var(--bb-court);
  display: inline-block;
  height: 44px;
  padding: 0 24px;
  border: 0;
  border-radius: 8px;
  font-family: var(--bb-font-display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  cursor: pointer;
}

.intent-button:disabled {
  opacity: 0.5;
  cursor: default;
}

.small {
  font-size: 13px;
  color: var(--bb-gold);
  margin-top: 12px;
}
</style>
