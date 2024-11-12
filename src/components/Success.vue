<template>
  <div class="success-page">
    <div class="success-container">
      <h1>Thank You for Your Continued Business!</h1>
      <p>
        We truly appreciate your ongoing partnership with Pomarium. Your recent payment was successfully processed,
        and we are thrilled to have you as a valued customer. Please know that your transaction was securely
        processed through Stripe.
      </p>

      <h2>What Happens Next?</h2>
      <ul class="next-steps">
        <li>Any updates to your subscription, payment history, and billing information will be reflected on your
          <strong>Firm Admin Page</strong>.
        </li>
        <li>If you need assistance or have questions about your transaction, please don’t hesitate to reach out
          to our support team.
        </li>
        <li>For future transactions, please ensure your billing info and/or payment method is up-to-date for
          uninterrupted service.
        </li>
      </ul>

      <div class="contact-info">
        <h3>Need Help?</h3>
        <p>Our support team is here to assist you with any questions or concerns. You can reach us at:</p>
        <p><a href="https://www.getpomarium.com/product/resources" target="_blank">Pomarium Support</a></p>
      </div>

      <div class="button-container">
        <a href="/dashboard" class="primary-button">Return to Dashboard</a>
        <a href="/admin" class="secondary-button">Return to Admin Page</a>
      </div>
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
