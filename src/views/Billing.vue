<template>
  <section class="payment-section">
    <div class="section-header">
      <h3 class="text-h3">Pomarium Invoice Payment</h3>
    </div>
    <div class="pay-here">
      <h1>Payment</h1>

      <p v-if="isSuper">
        Enable more payment method types
        <a
            href="https://dashboard.stripe.com/settings/payment_methods"
            target="_blank"
        >in your dashboard</a>.
      </p>

      <form
          id="payment-form"
          @submit.prevent="handleSubmit"
      >
        <div id="link-authentication-element"/>
        <div id="payment-element"/>
        <button
            id="submit"
            :disabled="isLoading"
            class="primary-btn"
        >
          Pay now
        </button>
        <sr-messages :messages="messages"/>
      </form>
    </div>
    <h2 class="text-h2">Or...</h2>
    <div class="button-group">
      <button type="button" @click="redirectToStripeCheckout" class="secondary-btn">
        Pay on Stripe Hosted Site
      </button>
    </div>
  </section>
</template>


<script setup>
import {loadStripe} from "@stripe/stripe-js";
import {ref, onMounted, inject} from "vue";
import {useRouter} from "vue-router";
import {useUserStore} from '@/store/user';
import {parseError} from "@/utils/error";
import {storeToRefs} from "pinia";
import SrMessages from "@/components/SrMessages.vue";

// Variable declarations outside of export default
const $axios = inject('$axios');
const {user} = storeToRefs(useUserStore());
const {isSuper} = useUserStore()
const router = useRouter();
let stripe;
let elements;


const isLoading = ref(false);
const messages = ref([]);
let email = ref(user.email);
let fullName = ref(user.full_name)
let cost = ref(250)
let total = ref(0)
const advisorsLength = ref(0)
let clientSecret = ref('')

const setValues = async () => {
  try {

    const response = await $axios.get(`/api/firms/${user.value.firm.id}/advisors-and-admin/`);
    let firmAdvisorList = response.data
    advisorsLength.value = firmAdvisorList.length;
    total.value = advisorsLength.value * cost.value

  } catch (error) {
    console.error('Error fetching billing data:', error);
    const parsedError = parseError(error);
    show({type: 'error', message: parsedError.message});
  }
};

async function handleSubmit(event) {
  console.log("handleSubmit is called correctly (if there is another log after this)")
  if (isLoading.value) return;
  console.log("handleSubmit is called correctly");
  isLoading.value = true;

  const {error} = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/success`
    }
  });

  if (error.type === "card_error" || error.type === "validation_error") {
    messages.value.push(error.message);
  } else {
    messages.value.push("An unexpected error occured.");
  }

  loading.value = false;
}

function redirectToStripeCheckout() {
  const baseUrl = window.location.origin; // Dynamically gets the base URL
  stripe.redirectToCheckout({
    successUrl: `${baseUrl}/success`,
    cancelUrl: `${baseUrl}/dashboard`,
    lineItems: [
      {
        price: "price_1QF0mvFKiZ5bBHF5XG0DO00A",
        quantity: advisorsLength.value
      },
    ],
    mode: "payment",
  });
}

onMounted(async () => {
  await setValues();

  // Load Stripe publishable key
  const publishableKey = import.meta.env.VITE_STRIPE_KEY;
  if (!publishableKey) {
    console.error("Stripe publishable key is missing.");
    return;
  }

  stripe = await loadStripe(publishableKey);
  // Fetch client secret from backend
  try {
    // Fetch client secret from backend using axios
    const response = await $axios.get("/api/billing/create-payment-intent");

    console.log("Response from backend:", response); // Log full response
    if (response.data.error) {
      messages.value.push(response.data.error.message);
      return;
    }

    clientSecret.value = response.data.clientSecret;
    console.log("Client Secret:", clientSecret.value); // Log the client secret

    elements = stripe.elements({clientSecret: clientSecret.value});
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

  } catch (error) {
    console.error("Error fetching client secret:", error);
    messages.value.push("An error occurred while fetching the payment intent.");
  } finally {
    isLoading.value = false;
  }
});

</script>

<style scoped>
/* Container for the entire section */
.payment-section {
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px;
}

/* Header styling */
.section-header {
  margin-bottom: 20px;
}

/* Headings */
.text-h3 {
  color: #07152A;
  font-family: "halyard-display" !important;
  font-size: 38px;
  font-weight: 400;
  line-height: 120%;
  letter-spacing: -0.5px;
}

.text-h2 {
  color: #07152A;
  font-family: "halyard-display" !important;
  font-size: 46px;
  font-weight: 400;
  line-height: 110%;
}

/* Form styling */
.payment-form {
  max-width: 600px;
  margin: 0 auto;
}

.fieldset-disabled {
  opacity: 0.6;
  pointer-events: none;
}

.form-group {
  margin-bottom: 20px;
}

/* Label styling */
.input-label {
  display: block;
  color: #07152A;
  font-family: "halyard-text" !important;
  font-size: 20px;
  font-weight: 300;
  line-height: 130%;
  margin-bottom: 8px;
}

/* Input field styling */
.input-field {
  width: 100%;
  padding: 10px;
  font-family: "halyard-text" !important;
  font-size: 16px;
  color: #07152A;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

/* Stripe card element styling */
.card-element {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 40px;
  box-sizing: border-box;
}

/* Button styling */
.primary-btn {
  background-color: #07152A;
  color: #ffffff;
  font-family: "halyard-text" !important;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  text-transform: uppercase;
}

.primary-btn.button-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.secondary-btn {
  background-color: #ffffff;
  border: 2px solid #07152A;
  color: #07152A;
  font-family: "halyard-text" !important;
  font-size: 14px;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 50px;
  cursor: pointer;
  text-transform: uppercase;
}

.button-group {
  margin-top: 20px;
  text-align: center;
}
</style>

