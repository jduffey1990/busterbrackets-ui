<template>
  <v-footer color="translucent">

    <v-btn variant="text" color="primary" @click="showTerms = true" class="footer-text">
      Terms & Conditions
    </v-btn>

    <v-dialog v-model="showTerms" max-width="600px">
      <v-card>
        <v-card-text>
          Terms & Conditions
        </v-card-text>
        <v-card-text>
          Data in this report pertain only to social impact, not financial performance. Pomarium is not an investment
          advisor and does not provide investment advice or investment recommendations. The information contained
          herein is believed to be from reliable sources, but we make no warranty or guarantee as to the accuracy of
          the information. Information presented may change over time based on market or other conditions without
          notice. Please consult with your advisor for more details about any of the metrics displayed in this report.
          <br><br>Investing involves risk. Depending on the types of investments, there may be varying degrees of risk.
          Socially
          responsible investing does not guarantee any amount of success. This analysis may not provide a complete
          picture of the social impact as it is only as reliable as the amount of data available. <br><br>
          Links to external websites are strictly as a courtesy. We make no representation as to the completeness or
          accuracy of information provided in the web links within this report. Nor is Pomarium liable for any direct or
          indirect technical or system issues or any consequences arising out of your access to or your use of
          third-party technologies, websites, information, and programs made available through this report. When you
          access one of these links, you assume total responsibility and risk for your use of the websites.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="showTerms = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-btn
        href="https://www.linkedin.com/company/getpomarium"
        target="_blank"
        rel="noopener noreferrer"
        icon="mdi-linkedin"
        class="footer-text"
        color="primary"
        variant="text"
    ></v-btn>
    <div class="footer-text">
      {{ new Date().getFullYear() }} — <strong>Pomarium</strong>
    </div>


  </v-footer>
</template>


<script>
export default {
  data() {
    return {
      showTerms: false,
    };
  },
};
</script>

<style scoped>
.v-footer {
  max-height: 60px;
  background-color: rgba(255, 255, 255, 0.5) !important;
  padding: 0px 16px;
  text-align: center;
  justify-content: center;
  display: flex;
  flex-direction: row;
}

@media only screen and (max-width: 700px) {
  .v-footer {
    display: flex;
    flex-direction: column;
    max-height: 150px;
    padding-bottom: 10px;
  }
}
</style>
