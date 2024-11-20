<template>
  <template v-if="stripeAccountAssociated && dateOfBlock.length !== 0 && stripeIsCurrent">
    <div class="subscription-status">
      <h2>Your Subscription Status</h2>
      <p class="subscription-message">
        Your Account is live until {{ dateOfBlock }}
      </p>
      <p>
        Thank you for your continued partnership with Pomarium! For uninterrupted access to your account and all
        features, please ensure your billing information remains up to date.
      </p>
    </div>

  </template>
  <template v-else-if="stripeAccountAssociated && !stripeIsCurrent">
    <div class="subscription-status">
      <h2>Your Subscription Status</h2>
      <p class="subscription-message">
        {{ user.firm.name }} has lapsed in access on {{ dateOfBlock }} due to late payment. Please remedy subscription
        status below or at your stripe customer account.
      </p>
    </div>

  </template>

  <template v-if="stripeAccountAssociated && canEdit">
    <div v-if="!editingUser" class="my-3">
      <div class="d-flex">
        <h4>User on File for Stripe Payments</h4>
        <v-tooltip
            :text="`${user.full_name} is responsible for receiving stripe correspondence and maintaining ${user.firm.name}'s active standing`"
            location="top"
        >
          <template v-slot:activator="{ props }">
            <v-icon
                v-bind="props"
                small
                color="grayblue"
                class="ml-2 icon-movement">mdi-information
            </v-icon>
          </template>
        </v-tooltip>
      </div>
      <v-data-table :items="customerTable" :items-per-page="-1" :headers="headers" :mobile="false"
                    style="max-width: 400px" class="mb-3">
        <template #bottom></template>
      </v-data-table>
      <div class="d-flex">
        <h4>Business Address</h4>
        <v-tooltip
            :text="`${user.firm.name}'s billing address to match your payment billing`"
            location="top"
        >
          <template v-slot:activator="{ props }">
            <v-icon
                v-bind="props"
                small
                color="grayblue"
                class="ml-2 icon-movement">mdi-information
            </v-icon>
          </template>
        </v-tooltip>
      </div>
      <v-data-table :items="addressTable" :items-per-page="-1" :headers="headers" :mobile="false"
                    style="max-width: 400px">
        <template #bottom></template>
      </v-data-table>
    </div>
    <v-data-table
        v-else
        :mobile="false"
        :headers="headers"
        :items="combinedTable"
        style="max-width: 400px"
        class="mb-3"
    >
      <template v-slot:item.value="{ item }">
        <v-text-field
            v-if="editingUser"
            v-model="item.value"
            hide-details
            min-width="150px"
        ></v-text-field>
        <v-select
            v-if="editingUser && item.title === 'Country'"
            v-model="item.value"
            :items="countryOptions"
            hide-details
            class="mb-4"
        ></v-select>
      </template>
    </v-data-table>

    <v-btn @click="changeEditButton" color="secondary">{{ buttonText }}</v-btn>
    <v-btn
        v-if="editingUser"
        @click="submitChangesCustomer"
        color="primary"
        :disabled="editSubmitDisabled">
      Submit Changes
    </v-btn>
  </template>
  <template v-if="!stripeAccountAssociated">
    <v-form @submit.prevent="submitSubscription" class="subscription-form">
      <div class="d-flex my-4 align-center">
        <div class="text-h4 my-4">Create Subscription</div>
      </div>

      <!-- Full Name Input -->
      <v-text-field
          v-model="fullName"
          label="Full Name of Admin Managing Billing"
          class="mb-4"
      ></v-text-field>

      <!-- Email Input -->
      <v-text-field
          v-model="email"
          label="Email of Admin Managing Billing"
          type="email"
          class="mb-4"
      ></v-text-field>

      <!-- Address Line 1 Input -->
      <v-text-field
          v-model="address.line1"
          label="Billing Address Line 1"
          class="mb-4"
          required
      ></v-text-field>

      <!-- Address Line 2 Input (Optional) -->
      <v-text-field
          v-model="address.line2"
          label="Billing Address Line 2"
          class="mb-4"
      ></v-text-field>

      <!-- City Input -->
      <v-text-field
          v-model="address.city"
          label="Billing City"
          class="mb-4"
          required
      ></v-text-field>

      <!-- State Input -->
      <v-text-field
          v-model="address.state"
          label=" Billing State"
          class="mb-4"
          required
      ></v-text-field>

      <!-- Postal Code Input -->
      <v-text-field
          v-model="address.postal_code"
          label="Billing Postal Code"
          class="mb-4"
          required
      ></v-text-field>

      <!-- Country Select (Optional if defaulted to US) -->
      <v-select
          v-model="address.country"
          label="Billing Country"
          class="mb-4"
          :items="countryOptions"
          required
      ></v-select>

      <!-- Submit Button -->
      <div class="d-flex justify-end mb-4">
        <v-btn color="primary" text type="submit" :disabled="createSubscriptionDisabled">Create Subscription</v-btn>
      </div>
    </v-form>

  </template>
  <template v-if="stripeAccountAssociated">
    <section class="payment-section my-7">
      <div class="section-header d-flex">
        <h4>Pomarium invoice payment hosted by Stripe</h4>
        <v-tooltip
            :text="`We present ${user.firm.name}'s oldest invoice first.  If there are multiple outstanding invoices you
            may have to submit another payment`"
            location="top"
        >
          <template v-slot:activator="{ props }">
            <v-icon
                v-bind="props"
                small
                color="grayblue"
                class="ml-2 icon-movement">mdi-information
            </v-icon>
          </template>
        </v-tooltip>
      </div>
      <div class="pay-here">
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
              :disabled="isPaymentButtonDisabled || isLoading"
              class="intent-button"
          >
            {{ intentButtonText }}
          </button>
          <sr-messages :messages="messages"/>
        </form>
      </div>
      <!-- List of unpaid invoices -->
      <div v-if="unpaidInvoices.length" class="my-5">
        <h5>Outstanding Invoices</h5>
        <v-list class="bg-transparent">
          <v-list-item
              v-for="(invoice, index) in unpaidInvoices"
              :key="index"
              class="d-flex justify-space-between"
          >
            <span class="mr-3">Invoice Date: {{ invoice.created_at }}</span>
            <span class="mr-3">Amount Due: ${{ invoice.amount }}</span>
            <a :href="invoice.invoice_url" target="_blank" @click="isPaymentButtonDisabled = true">
              Invoice Stripe Link (Will disable local payment button for payment integrity)
            </a>
          </v-list-item>
        </v-list>
      </div>
      <div v-if="futureInvoices.length" class="my-5">
        <h5>Upcoming Invoices</h5>
        <v-list class="bg-transparent">
          <v-list-item
              v-for="(invoice, index) in futureInvoices"
              :key="index"
              class="d-flex justify-space-between"
          >
            <span class="mr-3">Invoice Date: {{ invoice.created_at }}</span>
            <span class="mr-3">Amount Due: ${{ invoice.amount }}</span>
          </v-list-item>
        </v-list>
      </div>
    </section>
  </template>
  <template v-else>
    <v-alert
        title="No Payment Needed..."
        type="secondary"
        class="my-4"
    >
      You currently have no outstanding invoices. Thank you for your business!
    </v-alert>
  </template>
</template>


<script setup>
import {loadStripe} from "@stripe/stripe-js";
import {ref, onMounted, inject, reactive, watch} from "vue";
import {useRouter} from "vue-router";
import {useUserStore} from '@/store/user';
import {parseError} from "@/utils/error";
import {storeToRefs} from "pinia";
import SrMessages from "@/components/SrMessages.vue";
import {useOverlayStore} from "@/store/overlay";

// Variable declarations outside of export default
const $axios = inject('$axios');
const {show} = inject('toast');
const {user} = storeToRefs(useUserStore());
const {isSuper, stripeAccountAssociated, stripeIsCurrent, isFirmAdminOrGreater} = useUserStore()
const overlayStore = useOverlayStore();
const router = useRouter();
let stripe;
let elements;

let editingUser = ref(false)
const canEdit = ref(isFirmAdminOrGreater)
const createSubscriptionDisabled = ref(false)
const isLoading = ref(false);
const isPaymentButtonDisabled = ref(false)
const editSubmitDisabled = ref(false)
const messages = ref([]);
let email = ref('');
let fullName = ref('')
let cost = ref(250)
let total = ref(0)
const customerData = ref(null);
const errorMessage = ref("");
let clientSecret = ref('')
const buttonText = ref('Edit Stripe User Profile');
const intentButtonText = ref('$0 due (button disabled)');
let unpaidInvoices = ref([])
let futureInvoices = ref({})
let dateOfBlock = ref("")
const customerTable = ref([
  {title: "Firm Billing User", value: ""},
  {title: "Firm Billing Email", value: ""}
]);

const addressTable = ref([
  {title: "Line 1", value: ""},
  {title: "Line 2", value: ""},
  {title: "City", value: ""},
  {title: "State", value: ""},
  {title: "Postal Code", value: ""},
  {title: "Country", value: ""}
]);

// Combined table to hold all values for editing
const combinedTable = ref([]);

const headers = [
  {title: "Field", align: "start", value: "title"},
  {title: "Value", value: "value"}
];


const address = ref({
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "US",
});

const countryOptions = [
  {title: "United States", value: "US"},
  {title: "Canada", value: "CA"},
  // Add other countries as needed
];

//modification functions:
const changeEditButton = () => {
  editingUser.value = !editingUser.value; // Toggle the editing state
  buttonText.value = editingUser.value ? 'Cancel Edit' : 'Edit Stripe User Profile'; // Update button text
};


//apis
const getCustomer = async () => {
  try {
    const response = await $axios.get("/api/billing/retrieve-customer/");

    if (response.status === 200 && response.data.customer) {
      customerData.value = response.data.customer;

      // Set customer data
      customerTable.value[0].value = customerData.value.name;
      customerTable.value[1].value = customerData.value.email;

      // Set address data
      addressTable.value[0].value = customerData.value.address.line1;
      addressTable.value[1].value = customerData.value.address.line2;
      addressTable.value[2].value = customerData.value.address.city;
      addressTable.value[3].value = customerData.value.address.state;
      addressTable.value[4].value = customerData.value.address.postal_code;
      addressTable.value[5].value = customerData.value.address.country;

      // Combine customerTable and addressTable for the editable table
      combinedTable.value = [...customerTable.value, ...addressTable.value];

    } else {
      throw new Error("Customer data not found");
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
    errorMessage.value = "An error occurred while fetching customer data.";
  }
};

const getNextInvoice = async () => {
  try {
    let response = await $axios.get("/api/billing/retrieve-next-invoice/");
    console.log("Futuristic:", response);

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

const submitSubscription = async () => {
  try {
    createSubscriptionDisabled.value = true;

    // Validate the address fields
    if (!address.value.city || !address.value.country || !address.value.line1 || !address.value.postal_code || !address.value.state) {
      alert("All address fields except line 2 are required. Please complete the form before proceeding.");
      return;
    }

    // Post data to the subscription endpoint
    const response = await $axios.post("/api/billing/subscription-stripe/", {
      name: fullName.value,
      email: email.value.toLowerCase(),
      city: address.value.city,
      country: address.value.country,
      line1: address.value.line1,
      line2: address.value.line2,
      postal_code: address.value.postal_code,
      state: address.value.state,
    });

    if (response.status === 200 && response.data.customer_id) {
      console.log(`Customer ID: ${response.data.customer_id}`);
      console.log(`Subscription ID: ${response.data.subscription_id}`);
      router.push('/subscription-success');
    } else {
      throw new Error("Customer or subscription creation failed.");
    }
  } catch (error) {
    console.error("Error creating subscription:", error);
    show({type: "error", message: "There was an error creating the subscription. Please try again later."});
  }
};

const submitChangesCustomer = async () => {
  try {
    editSubmitDisabled.value = true;  // Set loading state
    changeEditButton()

    let objectified_combinedTable = {
      name: combinedTable.value[0].value,
      email: combinedTable.value[1].value.toLowerCase(),
      line1: combinedTable.value[2].value,
      line2: combinedTable.value[3].value,
      city: combinedTable.value[4].value,
      state: combinedTable.value[5].value,
      postal_code: combinedTable.value[6].value,
      country: combinedTable.value[7].value,
    }

    if (!objectified_combinedTable.city || !objectified_combinedTable.country ||
        !objectified_combinedTable.line1 || !objectified_combinedTable.postal_code || !objectified_combinedTable.state) {
      alert("All fields excepting line 2 are required. Please complete the form before proceeding.");
      return;
    }

    // Post data to the subscription endpoint
    const response = await $axios.post("/api/billing/customer-stripe-update/", {
      name: objectified_combinedTable.name,
      email: objectified_combinedTable.email.toLowerCase(),
      city: objectified_combinedTable.city,
      country: objectified_combinedTable.country,
      line1: objectified_combinedTable.line1,
      line2: objectified_combinedTable.line2,
      postal_code: objectified_combinedTable.postal_code,
      state: objectified_combinedTable.state,
    });

    if (response.status === 200) {
      console.log("Subscription updated successfully!");
    } else {
      console.error("Unexpected response status:", response.status);
    }
    editSubmitDisabled.value = false

    overlayStore.openOverlay(
        'Success!',
        `You have successfully updated ${user.value.firm.name}'s contact information`,
        '/UI-IMGs/Values-ss.png'
    );

    await getCustomer()

  } catch (error) {
    console.error("Error updating subscription:", error);

    // Optionally, show an error message in the UI
    show({type: "error", message: "There was an error updating the subscription."});

  }
}

const formatDate = () => {
  const unixDate = user.value.firm.subscription_end_date;
  const date = new Date(unixDate * 1000); // Convert Unix timestamp to milliseconds

  // Format the date with full weekday, day, month, and year
  const weekday = new Intl.DateTimeFormat('en-US', {weekday: 'long'}).format(date);
  const month = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(date);
  const year = date.getFullYear();

  // Get the day and apply the ordinal suffix
  const day = date.getDate();
  const ordinalSuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };
  const dayWithOrdinal = `${day}${ordinalSuffix(day)}`;

  // Construct the final formatted string
  dateOfBlock.value = `${weekday}, the ${dayWithOrdinal} of ${month} ${year}`;
};

const getPaymentIntent = async () => {
  try {
    isLoading.value = true
    // Fetch client secret from backend using axios
    const response = await $axios.get("/api/billing/create-payment-intent");

    if (!response.data.intents || response.data.intents.length === 0) {
      messages.value.push("No outstanding balance to pay.");
      isPaymentButtonDisabled.value = true;
      return;
    }

    // Load the oldest intent (the first in the list) for payment
    let newestFirst = response.data.intents.reverse()
    console.log("newestFirst", newestFirst)
    const oldestIntent = newestFirst[0];
    clientSecret.value = oldestIntent.client_secret;
    total.value = (parseInt(oldestIntent.amount) / 100).toFixed(2); // Convert cents to dollars

    // Initialize Stripe elements for the oldest intent
    elements = stripe.elements({clientSecret: clientSecret.value});
    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    const linkAuthenticationElement = elements.create("linkAuthentication");
    linkAuthenticationElement.mount("#link-authentication-element");

    // Optional: Show list of unpaid invoices to the user
    unpaidInvoices.value = response.data.intents.map(intent => ({
      amount: (parseInt(intent.amount) / 100).toFixed(2),
      created_at: new Date(intent.invoice_created_at * 1000).toLocaleDateString(),
      invoice_url: intent.invoice_url
    }));


  } catch (error) {
    console.error("Error fetching payment intents:", error);
    messages.value.push("An error occurred while fetching payment intents.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {

  if (stripeAccountAssociated) {
    await getCustomer()
  }
  fullName.value = user.value.full_name
  email.value = user.value.email

  // Load Stripe publishable key
  const publishableKey = import.meta.env.VITE_STRIPE_KEY;
  if (!publishableKey) {
    console.error("Stripe publishable key is missing.");
    return;
  }

  stripe = await loadStripe(publishableKey);
  // Fetch client secret from backend

  formatDate()
  await getPaymentIntent()
  await getNextInvoice()
  console.log("current", stripeIsCurrent)
  console.log("associated", stripeAccountAssociated)
});

watch(total, (newTotal) => {
  if (newTotal > 0) {
    intentButtonText.value = `Pay $${newTotal}`;
    isPaymentButtonDisabled.value = false;
  } else if (isLoading.value) {
    intentButtonText.value = "Loading..."
  } else {
    intentButtonText.value = '$0 due (button disabled)';
    isPaymentButtonDisabled.value = true;
  }
});

</script>

<style scoped>

.subscription-status {
  padding: 20px;
  background-color: #f0f8ff;
  border: 1px solid #d1e7fd;
  border-radius: 8px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.subscription-status h2 {
  color: #07152A;
  font-family: "halyard-display", sans-serif;
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 10px;
}

.subscription-message {
  font-size: 18px;
  color: #333;
  font-family: "halyard-text", sans-serif;
  font-weight: 400;
  margin-bottom: 15px;
}

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

.secondary-btn {
  background-color: #ffffff;
  border: 2px solid #07152A;
  color: #07152A; /* To set the text color to match the stroke */
}

/* Button styling */
.primary-btn.button-disabled {
  opacity: 0.5;
  pointer-events: none;
}

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
  font-size: 12px;
}

.intent-button:disabled {
  opacity: 0.5;
  pointer-events: none;
}

.intent-button:hover {
  box-shadow: none !important;
}

.button-group {
  margin-top: 20px;
  text-align: center;
}

.icon-movement {

}
</style>