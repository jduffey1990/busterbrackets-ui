<template>
  <section>
    <div>
      <h3>Pomarium Invoice Payment</h3>
    </div>
    <form @submit.prevent="handleSubmit">
      <fieldset :class="{ dis: loading }">
        <div class="nes-field">
          <label for="name_field">Name</label>
          <input
              v-model="fullName"
              type="text"
              name="name"
              id="name_field"
              class="nes-input"
          />
        </div>
        <div>
          <label for="email_field">Email</label>
          <input
              v-model="email"
              type="email"
              name="email"
              id="email_field"
              required
          />
        </div>
        <div>
          <label for="card_element">Credit Card</label>
          <div id="stripe-element-mount-point"></div>
        </div>
      </fieldset>
      <div>
        <button type="submit" :class="{ dis: loading }">
          {{ loading ? "Loading..." : `Pay total (${total})` }}
        </button>
      </div>
    </form>
    <h2>Or...</h2>
    <div>
      <button type="button" @click="redirectToStripeCheckout">
        Pay On stripe hosted site
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

// Variable declarations outside of export default
const $axios = inject('$axios');
const {user} = storeToRefs(useUserStore());
const router = useRouter();
let stripe = null;
let elements = null;
let email = ref(user.email);
let fullName = ref(user.full_name)
let loading = ref(true);
let cost = ref(250)
let total = ref(0)
const advisorsLength = ref(0)

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
  if (loading.value) return;
  loading.value = true;

  try {
    const {data} = await $axios.post(`/api/billing/create-checkout-session/${user.value.firm.id}`, {
      email: email.value,
    });
    const {client_secret: clientSecret} = data;

    const {paymentMethod, error: pmError} = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement("card"),
      billing_details: {email: email.value},
    });

    if (pmError) throw pmError;

    const {error} = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (error) {
      console.error("Payment error:", error);
    } else {
      router.push("/success");
    }
  } catch (error) {
    console.error("Checkout error:", error);
  } finally {
    loading.value = false;
  }
}

function redirectToStripeCheckout() {
  stripe.redirectToCheckout({
    successUrl: "http://localhost:3000/admin",
    cancelUrl: "http://localhost:3000",
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
  await setValues()

  stripe = await loadStripe(import.meta.env.VITE_STRIPE_KEY);
  elements = stripe.elements();
  const cardElement = elements.create("card");
  cardElement.mount("#stripe-element-mount-point");
  loading.value = false;
});

</script>

<style scoped>
/* Basic styling */
button.dis {
  opacity: 0.5;
  pointer-events: none;
}
</style>
