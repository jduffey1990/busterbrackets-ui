<template>
  <v-footer color="translucent">

    <v-btn variant="text" color="primary" @click="showTerms = true" class="footer-text">
      Terms & Conditions
    </v-btn>

    <v-dialog v-model="showTerms">
      <v-card>
        <v-card-text class="header_text text-h4">
          Disclosures & Privacy Policy
        </v-card-text>
        <v-card-text>
          <strong>POMARIUM Usage and Responsibility:</strong> POMARIUM is an interactive web-based investment tool
          developed by Inicio Inc. and licensed and distributed by The Planners Inc. DBA Pomarium (POMARIUM). It allows
          an investment professional (generally a registered investment advisor or a sophisticated investor) to select a
          desired investment strategy for the professional’s client. At all times, the investment professional, not
          POMARIUM, is responsible for determining the initial and ongoing suitability of any investment strategy for
          the investment professional’s underlying client. The client shall not rely on POMARIUM for any such initial or
          subsequent review or determination. Rather, the professional shall remain exclusively responsible for these
          assessments.<br><br>

          <strong>Reliance on Investment Professional:</strong> POMARIUM has relied, and shall continue to rely, on the
          investment professional’s knowledge and experience to understand the inherent limitations of performance
          presentations, including those pertaining to back-tested hypothetical performance. All performance
          presentations, including hypothetical performance, are the direct result of the investment professional’s
          request, independent of POMARIUM. Depending on the investment professional’s direction and selection,
          hypothetical presentations can include both POMARIUM and non-POMARIUM portfolios and strategies.<br><br>

          <strong>Intended Recipient:</strong> POMARIUM content is intended solely for the investment professional and
          is not to be shared with an underlying client. POMARIUM assumes that no hypothetical performance-related
          content will be provided directly to the professional’s client without the accompanying consultation and
          explanation of the professional, and where applicable, additional disclosures given and acknowledgments
          received by the end investor. The content is intended to assist the professional in evaluating the appropriate
          investment strategy for the professional’s client.<br><br>

          <strong>No Warranties Implied:</strong> The Planners Inc. DBA Pomarium is a registered investment adviser
          located in Fort Collins, CO. POMARIUM may only transact business in those states in which it is registered or
          qualifies for an exemption or exclusion from registration requirements. POMARIUM’s website is limited to the
          dissemination of general information pertaining to its advisory services, together with access to additional
          investment-related information, publications, and links. Accordingly, the publication of POMARIUM’s website on
          the Internet should not be construed by any consumer or prospective client as POMARIUM’s solicitation to
          effect or attempt to effect transactions in securities, or the rendering of personalized investment advice for
          compensation over the Internet. Any subsequent direct communication by POMARIUM with a prospective client
          shall be conducted by a representative that is either registered or qualifies for an exemption or exclusion
          from registration in the state where the prospective client resides. For information pertaining to the
          registration status of POMARIUM, please contact the state securities regulators for those states in which
          POMARIUM maintains a registration filing. A copy of POMARIUM’s current written disclosure statement discussing
          POMARIUM’s business operations, services, and fees is available at the SEC’s investment adviser public
          information website – <a href="https://www.adviserinfo.sec.gov" target="_blank">www.adviserinfo.sec.gov</a> or
          from POMARIUM upon written request. POMARIUM does not make any representations or warranties as to the
          accuracy, timeliness, suitability, completeness, or relevance of any information prepared by any unaffiliated
          third party, whether linked to POMARIUM’s website or incorporated herein, and takes no responsibility for it.
          All such information is provided solely for convenience purposes only, and all users thereof should be guided
          accordingly.<br><br>

          <strong>General Guidance:</strong> This website and information are provided for guidance and information
          purposes only. Investments involve risk and, unless otherwise stated, are not guaranteed. Be sure to first
          consult with a qualified financial adviser and/or tax professional before implementing any strategy. This
          website and information are not intended to provide investment, tax, or legal advice.<br><br>

          <address>
            The Planners Inc.<br>
            320 East Vine Drive, Suite 101<br>
            Fort Collins, CO 80524<br>
            (970) 658-4165<br>
            <a href="mailto:COMPLIANCE@THEPLANNERSINC.COM">COMPLIANCE@THEPLANNERSINC.COM</a>
          </address>
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
    <div class="footer-text px-4">
      {{ new Date().getFullYear() }} — <strong>Pomarium</strong>
    </div>


  </v-footer>
</template>


<script>
export default {
  data() {
    return {
      showTerms: false,
      showDisclosures: false
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

.v-dialog {
  max-width: 40%;
  max-height: 70%;
}

.header_text {
  line-height: 1.1 !important; /* Ensure proper vertical spacing */
  white-space: normal; /* Allow text to wrap */
  display: block; /* Ensure block-level display */
  padding: 10px; /* Add some padding if necessary */
}

@media only screen and (max-width: 1275px) {
  .v-dialog {
    max-width: 100%;
    max-height: 90%;
  }
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
