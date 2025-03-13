<template>
  <!-- Page Container -->
  <div class="px-0 py-0 d-flex flex-column">
    <!-- Registration/Log In Notice -->
    <div class="center">
    </div>
    <!-- Hero / Header Section -->
    <div class="hero-header">
      <h1 class="display-1 font-weight-bold mb-3 mt-10 white--text">
        Welcome to Buster Brackets!
      </h1>
      <p class="subtitle-1 white--text">
        Where every bracket is a masterpiece in the making.
      </p>
    </div>

    <!-- Main Content Section -->
    <v-row justify="center" >
      <v-col class="content-bottom">
        <!-- Registration/Log In Notice -->
        <!-- Services Card -->
        <v-card
          elevation="6"
          class="mb-6 services-card"
        >
          <v-card-title class="white--text">
            What We Offer
          </v-card-title>
          <v-card-text class="white--text px-8">
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

        <v-btn
        href="/login"
        color="warning"
        elevation="3"
        large
        rounded
        class="mx-auto mt-4 mb-4"
      >
        Get Started
      </v-btn>

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
  </div>
</template>

<style scoped>
/* Page Container to allow for a gradient hero header */
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
  padding: 10px;
  margin-bottom: 40px;
}
.display-1 {
  text-align: center;
  padding: 10px;
}

/* Subtitle style tweak */
.subtitle-1 {
  text-align: center;
  letter-spacing: 0.5px;
  max-width: 600px;
  margin: 0;
}

.content-bottom {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* Services card slight style changes */
.services-card {
  border-radius: 12px;
  background-color: rgba(255,255,255,0.2);
  margin-top:20px
}

/* Tweak the look of bullet points */
.services-card ul {
  list-style: disc;
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
