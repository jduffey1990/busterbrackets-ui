<template>
  <div class="my-4">
    <div v-if="$route.query.success">
      <div class="text-h4 mb-4">Survey Submitted!</div>
      <v-alert type="success"
        >Your survey has been submitted and your advisor will be reaching out to
        you shortly!</v-alert
      >
    </div>

    <div v-else>
      <div class="text-h4 mb-4">Welcome to Pomarium!</div>
      <v-alert type="info">
        Please click the "LOG IN" button in the navbar to begin the login
        process. If you need to register, please reach out to
        <a href="mailto:support@getpomarium.com">support@getpomarium.com</a>.
      </v-alert>
    </div>
  </div>
</template>
