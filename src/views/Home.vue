<template>
  <!-- Page Container -->
  <v-container fluid class="px-0 py-0 page-container">
    <!-- Registration/Log In Notice -->
    <div class="center">
      <v-img :width="400" src="@/assets/buster.png"></v-img>
    </div>
    <!-- Hero / Header Section -->
    <div class="hero-header">
      <h1 class="display-1 font-weight-bold mb-3 white--text">
        Welcome to Buster Brackets!
      </h1>
      <p class="subtitle-1 mb-6 white--text">
        Where every bracket is a masterpiece in the making.
      </p>
      <v-btn
        href="/login"
        color="warning"
        elevation="3"
        large
        rounded
        class="mx-auto my-4"
      >
        Get Started
      </v-btn>
    </div>

    <!-- Main Content Section -->
    <v-row justify="center" class="mt-n8">
      <v-col cols="12" sm="10">
        <!-- Registration/Log In Notice -->
        <!-- Services Card -->
        <v-card
          elevation="6"
          class="mb-6 services-card"
        >
          <v-card-title class="white--text">
            What We Offer
          </v-card-title>
          <v-card-text class="white--text px-4">
            <p>
              At Buster Brackets, we strive to bring you the ultimate college basketball 
              championship bracket experience. Here’s what you can expect:
            </p>
            <ul class="white--text">
              <li>
                <strong>Bracket Management:</strong>
                Create and save your bracket so you can track its performance. PDF downloads allow you to share with your tournament competition or even stick your pride-and-joy to the fridge!
              </li>
              <li>
                <strong>Smart Algorithm:</strong>
                We use historical win/loss records, advanced analytics, and 
                an odds mapping system to help you make informed picks, 
                even when data is limited.
              </li>
              <li>
                <strong>Developing AI Insights:</strong>
                Our AI is constantly learning and will soon provide 
                an even deeper analysis of your bracket picks.
              </li>
            </ul>
          </v-card-text>
        </v-card>

        <!-- Disclaimer -->
        <v-alert
          type="warning"
          elevation="2"
          border="start"
          class="mb-6"
        >
          <strong>Disclaimer:</strong> All predictions, projections, and suggestions 
          provided on this website are for entertainment purposes only. We do not 
          guarantee the accuracy or outcome of any bracket, and we cannot be held liable 
          for any financial losses, wagering issues, or other damages incurred by following 
          these picks or strategies. By using Buster Brackets, you acknowledge that all final 
          decisions are your own and agree to hold Buster Brackets and its creators harmless 
          for any results or consequences thereof.
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
/* Page Container to allow for a gradient hero header */
.page-container {
  background-color: transparent;
}
.center{
display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hero-header {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 20vh;
  padding: 2rem;
}

/* Subtitle style tweak */
.subtitle-1 {
  font-size: 1.25rem;
  letter-spacing: 0.5px;
  max-width: 600px;
  margin: 0 auto;
}

/* Services card slight style changes */
.services-card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
}

/* Tweak the look of bullet points */
.services-card ul {
  list-style: disc;
  margin-left: 1.5rem;
}

/* Button hover effect (just an example) */
.v-btn:hover {
  transform: scale(1.02);
  transition: transform 0.2s ease-in-out;
}

/* Minor text shadow for that “pop” */
.hero-header h1 {
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 700px) {
  .hero-header {
    height: 30vh;
  }
}
</style>
