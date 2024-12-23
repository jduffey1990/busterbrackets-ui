<template>
  <div class="success-page">
    <div class="success-container">
      <h4>Payment Information</h4>
      <p>By providing your payment information, you acknowledge that Pomarium may charge your agreed upon subscription
        terms for continued access to the application and related data, following the conclusion
        of any applicable trial period, unless you cancel prior to the trial's end. Please see below for more
        information and reach out to <a href="mailto:support@getpomarium.com">support@getpomarium.com</a>
        with any questions.</p>

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
        <sr-messages :messages="messages" class="small"/>
      </form>

      <div v-if="unpaidInvoices.length" class="my-5">
        <h5>Outstanding Invoices</h5>
        <v-list class="bg-transparent">
          <v-list-item
              v-for="(invoice, index) in unpaidInvoices"
              :key="index"
              class="d-flex justify-space-between"
          >
            <span class="small mr-3">Invoice Date: {{ invoice.created_at }}</span>
            <span class="small mr-3">Amount Due: ${{ invoice.amount }}</span>
            <a :href="invoice.invoice_pdf" target="_blank">
              Invoice PDF
            </a>
          </v-list-item>
        </v-list>
      </div>
      <div v-if="futureInvoices.length && !stripeIsPaused" class="my-5">
        <h5>Upcoming Invoices</h5>
        <v-list class="bg-transparent">
          <v-list-item
              v-for="(invoice, index) in futureInvoices"
              :key="index"
              class="d-flex justify-space-between"
          >
            <span class="small mr-3">Invoice Date: {{ invoice.created_at }}</span>
            <span class="small mr-3">Amount Due: ${{ invoice.amount }}</span>
          </v-list-item>
        </v-list>
      </div>
      <hr>

      <div>
        <p class="disclosure-payment">POMARIUM Usage and Responsibility: POMARIUM is an interactive web-based investment
          tool developed by Inicio Inc. DBA POMARIUM. It allows an investment professional (generally a registered
          investment advisor or a sophisticated investor) to select a desired investment strategy for the professional’s
          client. At all times, the investment professional, not POMARIUM, is responsible for determining the initial
          and ongoing suitability of any investment strategy for the investment professional’s underlying client. The
          client shall not rely on POMARIUM for any such initial or subsequent review or determination. Rather, the
          professional shall remain exclusively responsible for these assessments.</p>
      </div>

      <div class="contact-info">
        <h2>Need Help?</h2>
        <p>Our support team is here to assist you with any questions or concerns. You can reach us at:</p>
        <p><a href="https://www.getpomarium.com/product/resources" target="_blank">Pomarium Support</a></p>
      </div>
    </div>
  </div>
</template>
<script setup>
import {loadStripe} from '@stripe/stripe-js';
import {inject, onMounted, ref} from 'vue';
import {useUserStore} from '@/store/user';
import {storeToRefs} from "pinia";
import SrMessages from "@/components/SrMessages.vue";

const {stripeAccountAssociated, stripeIsPaused} = useUserStore();
const {stripePublicKey} = storeToRefs(useUserStore())

const $axios = inject('$axios');

let unpaidInvoices = ref([])
let futureInvoices = ref({})
const setupBtnDisabled = ref(false);
const stateClient = ref({});
let stripe;
let elements;
const messages = ref([]);


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
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      console.error("SetupIntent error:", error.message);
      alert("Error setting up payment method: " + error.message);
      return; // Exit early if there's an error
    }
  } catch (err) {
    console.error("Error handling SetupIntent:", err);
    alert("An error occurred while setting up your payment method.");
  } finally {
    setupBtnDisabled.value = false;
  }
};

const getNextInvoice = async () => {
  try {
    let response = await $axios.get("/api/billing/retrieve-next-invoice/");

    if (response.status === 200 && response.data.amount_due) {
      futureInvoices.value = [{
        amount: (parseInt(response.data.amount_due) / 100).toFixed(2),
        created_at: new Date(response.data.created_at * 1000).toLocaleDateString(),
        invoice_url: response.data.invoice_url
      }];
    } else {
      throw new Error("Invoice data not found");
    }
  } catch (error) {
    console.error("Error fetching upcoming invoice:", error);
    errorMessage.value = "An error occurred while fetching upcoming invoice data.";
  }
};


onMounted(async () => {
  if (!stripeAccountAssociated) {
    setTimeout(() => {
      window.location.reload();
    }, 500);
  } else {
    try {

      // Request a SetupIntent and outstanding invoices from the backend
      const response = await $axios.post("/api/billing/create-setup-intent/");
      const {client_secret: clientSecret, outstanding_invoices: invoices} = response.data;

      if (!clientSecret) {
        throw new Error("SetupIntent client secret not received.");
      }

      // Set the client secret
      stateClient.value = {clientSecret};

      // Populate the unpaid invoices array
      unpaidInvoices.value = invoices.map(invoice => ({
        amount: (parseInt(invoice.amount_due) / 100).toFixed(2), // Convert cents to dollars
        created_at: new Date(invoice.invoice_created_at * 1000).toLocaleDateString(),
        invoice_url: invoice.invoice_url,
        invoice_pdf: invoice.invoice_pdf,
      }));

      // Initialize Stripe elements
      stripe = await loadStripe(stripePublicKey.value);
      elements = stripe.elements({
        clientSecret: clientSecret,
        appearance,
      });

      const paymentElement = elements.create("payment", {
        layout: "tabs", // Optional layout customization
      });
      paymentElement.mount("#payment-element");

      await getNextInvoice()
    } catch (err) {
      console.error("Error during Stripe initialization:", err);
      messages.value.push("An error occurred while initializing Stripe.");
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

.disclosure-payment {
  font-size: 14px !important;
  color: rgba(7, 21, 42, 0.6);
  line-height: 1.3;
  margin-top: 20px;
}

.contact-info p, .contact-info a {
  font-size: 20px;
  font-family: "halyard-text" !important;
  color: var(--Primary-Dark, #07152A);
}

</style>