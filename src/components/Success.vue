<template>
  <div class="success-page">
    <div class="success-container">
      <h3 class="font-weight-regular text-h3">Thank you!</h3>
      <p class="my-3">
        Your recent payment has been successfully processed and your transaction was securely handled through Stripe.
        Thank you for being a valued customer.
      </p>

      <h4 class="text-h4">What Happens Next?</h4>
      <ul class="next-steps">
        <li>Any changes to your subscription or billing details can be viewed on your
          <strong><a href="/billing" target="_blank">Billing Page</a></strong>.
        </li>
        <li>To ensure uninterrupted service, please keep your billing information and payment method up-to-date for
          future transactions.
        </li>
        <li>If you have any questions or need assistance with this transaction, reach out support
          <a href="https://www.getpomarium.com/product/resources" target="_blank">here</a> or at
          <a href="mailto:support@getpomarium.com">support@getpomarium.com</a>.
        </li>
      </ul>
    </div>
  </div>
</template>

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
</style>
