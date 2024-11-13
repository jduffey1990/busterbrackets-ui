<template>
  <div class="blocked-page">
    <div class="blocked-container">
      <h1>Access Restricted</h1>
      <p>
        We regret to inform you that access to certain areas of Pomarium has been temporarily restricted. This
        restriction is due to an outstanding billing issue associated with your firm’s account.
      </p>

      <h2>What You Can Do</h2>
      <ul class="next-steps">
        <li>Please contact your firm administrator to resolve the outstanding billing issue.</li>
        <li>If you have any questions or require assistance, feel free to reach out to our support team using the link
          below.
        </li>
      </ul>

      <div class="contact-info">
        <h3>Need Help?</h3>
        <p>Our support team is here to assist you with any questions. You can reach us at:</p>
        <p><a href="https://www.getpomarium.com/product/resources" target="_blank">Pomarium Support</a></p>
      </div>

      <div v-if="accountEmail.length" class="button-container">
        <a :href="`mailto:${accountEmail}?subject=Urgent: Billing Required to Restore Access&body=Dear Firm Admin,%0D%0A%0D%0AOur account is currently restricted due to an overdue balance. Could you please address this issue at your earliest convenience to restore full access to Pomarium's features?%0D%0A%0D%0AThank you!`"
           class="primary-button">
          Contact Firm Admin
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted} from "vue";
import {useUserStore} from "@/store/user";
import {inject} from "vue";

// Initialize the store and inject axios
const userStore = useUserStore();
const {stripeAccountAssociated} = userStore;
const $axios = inject('$axios');

const accountEmail = ref("");

// Define the function to fetch customer data
const getCustomer = async () => {
  try {
    const response = await $axios.get("/api/billing/retrieve-customer/");
    if (response.status === 200 && response.data.customer) {
      accountEmail.value = response.data.customer.email
    } else {
      throw new Error("Customer data not found");
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
  }
};

// Use onMounted to fetch customer data if subscription is associated
onMounted(async () => {
  if (stripeAccountAssociated) {
    await getCustomer();
  }
});
</script>

<style scoped lang="scss">
.blocked-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: transparent;
  padding: 20px;
}

.blocked-container {
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
  color: #07152A; /* To set the text color to match the stroke */
}

.secondary-button:hover {
  background-color: #eef7ff;
}
</style>
<script setup>
</script>