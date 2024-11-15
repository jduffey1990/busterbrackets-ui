<template>
  <div class="success-page">
    <div class="success-container">
      <h1>Welcome to Pomarium!</h1>
      <p>
        Thank you for choosing Pomarium! Your subscription is now active though it may take a couple of minutes for
        Stripe to process, and we're excited to support you on this journey. Your account has been set up with all the
        tools and resources you need to get started.
      </p>

      <h2>What Happens Next?</h2>
      <ul class="next-steps">
        <li>Start by adding any advisors that need access in your <a href="/admin">firm admin page</a>.
        </li>
        <li>Manage clients in your <a href="/dashboard">dashboard</a>.
        </li>
        <li>Ensure that your account and payment information remain up-to-date to enjoy uninterrupted service on your
          <a href="/billing">billing page</a>. Though it may take a minute or two for the subscription to be live.
        </li>
      </ul>

      <div class="contact-info">
        <h3>Need Help?</h3>
        <p>Our support team is here to assist you with any questions or concerns. You can reach us at:</p>
        <p><a href="https://www.getpomarium.com/product/resources" target="_blank">Pomarium Support</a></p>
      </div>

      <div class="button-container">
        <a href="/dashboard" class="primary-button">Go to Dashboard</a>
        <a href="/admin" class="secondary-button">Visit Admin Page</a>
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
  color: #07152A;
}

.secondary-button:hover {
  background-color: #eef7ff;
}
</style>
