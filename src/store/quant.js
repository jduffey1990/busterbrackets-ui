import {defineStore} from 'pinia'
import axios from "axios";

export const useQuantStore = defineStore('quant', {
  state: () => ({
    loading: false,
    esgMetrics: {
      "valuesScores": {
        "portfolio": {
          "Community": 190.4439681904571,
          "Community_AddressesHumanRightsInSupplyChain": 174.13410623186957,
          "Community_ContributesToCommunityDevelopment": 177.67061518455534,
          "Community_CreatesJobsInTheUS": 303.79271381414424,
          "Community_GivesBackToLocalCommunities": 317.6261228368511,
          "Customer": 262.6413183955187,
          "Customer_CommunicatesTransparently": 375.59880014004204,
          "Customer_MakesBeneficialProducts": 597.869656396919,
          "Customer_ProtectsCustomerPrivacy": 205.13053716114834,
          "Customer_TreatsCustomersFairly": 524.8251595478644,
          "Environmental": 143.46482044613384,
          "Environmental_CombatsClimateChange": 180.13107732319693,
          "Environmental_MinimizesPollution": 190.34912723817143,
          "Environmental_UsesResourcesEfficiently": 251.46485895768728,
          "Environmental_UsesSustainableMaterials": 201.44766279883967,
          "Shareholder": 295.62228468540565,
          "Shareholder_GeneratesReturnForInvestors": 222.93175752725818,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 597.869656396919,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 300.30099129738926,
          "Workers": 174.94590577173153,
          "Workers_CultivatesADiverseInclusiveWorkplace": 266.62838751625486,
          "Workers_PaysAFairLivingWage": 284.7716029808943,
          "Workers_ProtectsWorkerHealthAndSafety": 328.426911073322,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 201.47527158147443,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 276.67933480044013
        },
        "direct_index": {
          "Community": 275.156244873462,
          "Community_AddressesHumanRightsInSupplyChain": 264.11075222566774,
          "Community_ContributesToCommunityDevelopment": 268.99323397019106,
          "Community_CreatesJobsInTheUS": 357.1515229568871,
          "Community_GivesBackToLocalCommunities": 359.5508982694808,
          "Customer": 314.71472141642494,
          "Customer_CommunicatesTransparently": 389.0377158147444,
          "Customer_MakesBeneficialProducts": 553.0204366309893,
          "Customer_ProtectsCustomerPrivacy": 288.8763088926678,
          "Customer_TreatsCustomersFairly": 507.20754326297885,
          "Environmental": 230.88961238371508,
          "Environmental_CombatsClimateChange": 263.7282079623887,
          "Environmental_MinimizesPollution": 269.4804016204862,
          "Environmental_UsesResourcesEfficiently": 311.0765924777433,
          "Environmental_UsesSustainableMaterials": 271.04216614984495,
          "Shareholder": 343.06005001500455,
          "Shareholder_GeneratesReturnForInvestors": 294.24017955386614,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 553.0204366309893,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 347.87196759027705,
          "Workers": 264.05122936881065,
          "Workers_CultivatesADiverseInclusiveWorkplace": 319.61121536460934,
          "Workers_PaysAFairLivingWage": 347.7465854756427,
          "Workers_ProtectsWorkerHealthAndSafety": 371.9902720816245,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 282.5422196658998,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 328.1782199659898
        },
        "filtered_market": {
          "Community": 294.7648934817917,
          "Community_AddressesHumanRightsInSupplyChain": 289.85618864388283,
          "Community_ContributesToCommunityDevelopment": 295.41644594781593,
          "Community_CreatesJobsInTheUS": 366.36906731815924,
          "Community_GivesBackToLocalCommunities": 379.7817471881437,
          "Customer": 344.90190893288855,
          "Customer_CommunicatesTransparently": 406.13094155931947,
          "Customer_MakesBeneficialProducts": 555.2774758872606,
          "Customer_ProtectsCustomerPrivacy": 315.8307806742147,
          "Customer_TreatsCustomersFairly": 505.77236352012926,
          "Environmental": 262.79498143776857,
          "Environmental_CombatsClimateChange": 292.3294194488964,
          "Environmental_MinimizesPollution": 296.64667800385183,
          "Environmental_UsesResourcesEfficiently": 334.7870245387095,
          "Environmental_UsesSustainableMaterials": 296.6639029644772,
          "Shareholder": 363.01720350477336,
          "Shareholder_GeneratesReturnForInvestors": 309.21267359312805,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 555.2774758872606,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 369.4728407393481,
          "Workers": 297.70725378744197,
          "Workers_CultivatesADiverseInclusiveWorkplace": 346.11913685906586,
          "Workers_PaysAFairLivingWage": 374.6930888319781,
          "Workers_ProtectsWorkerHealthAndSafety": 397.3964938365881,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 312.5677606427281,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 352.1377104736662
        },
        "market": {
          "Community": 299.67826264030896,
          "Community_AddressesHumanRightsInSupplyChain": 299.1265453294919,
          "Community_ContributesToCommunityDevelopment": 292.2025930183115,
          "Community_CreatesJobsInTheUS": 374.42173120353937,
          "Community_GivesBackToLocalCommunities": 375.7127910334805,
          "Customer": 365.7912168297439,
          "Customer_CommunicatesTransparently": 405.1872830713935,
          "Customer_MakesBeneficialProducts": 555.8915082239553,
          "Customer_ProtectsCustomerPrivacy": 332.8451764217282,
          "Customer_TreatsCustomersFairly": 510.2201396421677,
          "Environmental": 261.3973747946132,
          "Environmental_CombatsClimateChange": 288.4986040778231,
          "Environmental_MinimizesPollution": 299.732720851512,
          "Environmental_UsesResourcesEfficiently": 339.29262994911664,
          "Environmental_UsesSustainableMaterials": 288.91908680958835,
          "Shareholder": 373.49791386960055,
          "Shareholder_GeneratesReturnForInvestors": 302.82996886391584,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 555.8915082239553,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 373.45450175443267,
          "Workers": 287.54741329841147,
          "Workers_CultivatesADiverseInclusiveWorkplace": 333.27525264467033,
          "Workers_PaysAFairLivingWage": 370.08625291243516,
          "Workers_ProtectsWorkerHealthAndSafety": 380.7536721489763,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 301.8999375892241,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 352.1971002969955
        },
        "best": {
          "Community": 50.5,
          "Community_AddressesHumanRightsInSupplyChain": 50.5,
          "Community_ContributesToCommunityDevelopment": 50.525,
          "Community_CreatesJobsInTheUS": 50.5,
          "Community_GivesBackToLocalCommunities": 50.5,
          "Customer": 50.505,
          "Customer_CommunicatesTransparently": 55.82,
          "Customer_MakesBeneficialProducts": 60.39,
          "Customer_ProtectsCustomerPrivacy": 51.18,
          "Customer_TreatsCustomersFairly": 465.0,
          "Environmental": 50.5,
          "Environmental_CombatsClimateChange": 50.5,
          "Environmental_MinimizesPollution": 50.5,
          "Environmental_UsesResourcesEfficiently": 50.5,
          "Environmental_UsesSustainableMaterials": 50.5,
          "Shareholder": 50.5,
          "Shareholder_GeneratesReturnForInvestors": 50.5,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 60.39,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 50.5,
          "Workers": 50.5,
          "Workers_CultivatesADiverseInclusiveWorkplace": 58.32,
          "Workers_PaysAFairLivingWage": 50.5,
          "Workers_ProtectsWorkerHealthAndSafety": 50.5,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 50.5,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 50.5
        },
        "worst": {
          "Community": 901.5,
          "Community_AddressesHumanRightsInSupplyChain": 864.565,
          "Community_ContributesToCommunityDevelopment": 747.06,
          "Community_CreatesJobsInTheUS": 901.5,
          "Community_GivesBackToLocalCommunities": 819.5,
          "Customer": 900.7,
          "Customer_CommunicatesTransparently": 788.94,
          "Customer_MakesBeneficialProducts": 901.5,
          "Customer_ProtectsCustomerPrivacy": 896.3,
          "Customer_TreatsCustomersFairly": 569.61,
          "Environmental": 901.48,
          "Environmental_CombatsClimateChange": 901.5,
          "Environmental_MinimizesPollution": 692.5,
          "Environmental_UsesResourcesEfficiently": 901.5,
          "Environmental_UsesSustainableMaterials": 892.95,
          "Shareholder": 901.5,
          "Shareholder_GeneratesReturnForInvestors": 900.73,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 901.5,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 901.5,
          "Workers": 901.5,
          "Workers_CultivatesADiverseInclusiveWorkplace": 865.8,
          "Workers_PaysAFairLivingWage": 901.5,
          "Workers_ProtectsWorkerHealthAndSafety": 901.32,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 901.5,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 901.5
        },
        "portfolio_vs_DI": {
          "Community": 37.707510303450164,
          "Community_AddressesHumanRightsInSupplyChain": 42.12177760543763,
          "Community_ContributesToCommunityDevelopment": 41.8013260445435,
          "Community_CreatesJobsInTheUS": 17.40047094116168,
          "Community_GivesBackToLocalCommunities": 13.565653964245355,
          "Customer": 19.709116962745128,
          "Customer_CommunicatesTransparently": 4.03307358429101,
          "Customer_MakesBeneficialProducts": -12.869971292531204,
          "Customer_ProtectsCustomerPrivacy": 35.23225586533403,
          "Customer_TreatsCustomersFairly": -28.232247905127117,
          "Environmental": 48.464426960248645,
          "Environmental_CombatsClimateChange": 39.20547447171598,
          "Environmental_MinimizesPollution": 36.13623584427284,
          "Environmental_UsesResourcesEfficiently": 22.87685664826078,
          "Environmental_UsesSustainableMaterials": 31.55609857559849,
          "Shareholder": 16.2147105618713,
          "Shareholder_GeneratesReturnForInvestors": 29.25591593356848,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": -12.869971292531204,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 15.99712867301322,
          "Workers": 41.725502522484206,
          "Workers_CultivatesADiverseInclusiveWorkplace": 20.277309275178467,
          "Workers_PaysAFairLivingWage": 21.18610795611941,
          "Workers_ProtectsWorkerHealthAndSafety": 13.550444536387712,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 34.93629228385575,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 18.546245784727837
        },
        "portfolio_vs_filtered": {
          "Community": 42.70811241203232,
          "Community_AddressesHumanRightsInSupplyChain": 48.34722806527724,
          "Community_ContributesToCommunityDevelopment": 48.080826305526045,
          "Community_CreatesJobsInTheUS": 19.81085202020904,
          "Community_GivesBackToLocalCommunities": 18.87612200860267,
          "Customer": 27.942070056218625,
          "Customer_CommunicatesTransparently": 8.715725887227904,
          "Customer_MakesBeneficialProducts": -12.3019669557343,
          "Customer_ProtectsCustomerPrivacy": 41.82879915602381,
          "Customer_TreatsCustomersFairly": -29.845710271154562,
          "Environmental": 56.209600520686244,
          "Environmental_CombatsClimateChange": 46.39565458222063,
          "Environmental_MinimizesPollution": 43.184637561518095,
          "Environmental_UsesResourcesEfficiently": 29.309169391822444,
          "Environmental_UsesSustainableMaterials": 38.68001726450435,
          "Shareholder": 21.565186832454916,
          "Shareholder_GeneratesReturnForInvestors": 33.35009254380867,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": -12.3019669557343,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 21.685811645162392,
          "Workers": 49.65928229649169,
          "Workers_CultivatesADiverseInclusiveWorkplace": 27.620218118213923,
          "Workers_PaysAFairLivingWage": 27.737015053299945,
          "Workers_ProtectsWorkerHealthAndSafety": 19.8818909930394,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 42.39074993001673,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 25.016227432151183
        },
        "portfolio_vs_market": {
          "Community": 43.83781044638413,
          "Community_AddressesHumanRightsInSupplyChain": 50.27316730479294,
          "Community_ContributesToCommunityDevelopment": 47.39039991393752,
          "Community_CreatesJobsInTheUS": 21.8043467250472,
          "Community_GivesBackToLocalCommunities": 17.86112656025557,
          "Customer": 32.71627268436117,
          "Customer_CommunicatesTransparently": 8.469162501774678,
          "Customer_MakesBeneficialProducts": -12.146156466596809,
          "Customer_ProtectsCustomerPrivacy": 45.342715376840495,
          "Customer_TreatsCustomersFairly": -24.59177344027981,
          "Environmental": 55.91940367362582,
          "Environmental_CombatsClimateChange": 45.53284132674622,
          "Environmental_MinimizesPollution": 43.8881352495081,
          "Environmental_UsesResourcesEfficiently": 30.412054146570167,
          "Environmental_UsesSustainableMaterials": 36.68809623476458,
          "Shareholder": 24.110257633315413,
          "Shareholder_GeneratesReturnForInvestors": 31.6641783361641,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": -12.146156466596809,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 22.65133635222329,
          "Workers": 47.50168160870394,
          "Workers_CultivatesADiverseInclusiveWorkplace": 24.23916782362562,
          "Workers_PaysAFairLivingWage": 26.69534410634259,
          "Workers_ProtectsWorkerHealthAndSafety": 15.844414608673867,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 39.94617777982067,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 25.030988173971323
        },
        "DI_vs_filtered": {
          "Community": 8.027616383519064,
          "Community_AddressesHumanRightsInSupplyChain": 10.75611897234856,
          "Community_ContributesToCommunityDevelopment": 10.789765185695957,
          "Community_CreatesJobsInTheUS": 2.91815353732873,
          "Community_GivesBackToLocalCommunities": 6.143932693330699,
          "Customer": 10.253907768897518,
          "Customer_CommunicatesTransparently": 4.879443864496199,
          "Customer_MakesBeneficialProducts": 0.45607120128162765,
          "Customer_ProtectsCustomerPrivacy": 10.18492056319602,
          "Customer_TreatsCustomersFairly": -2.2481718026984354,
          "Environmental": 15.028790995422625,
          "Environmental_CombatsClimateChange": 11.827019041639685,
          "Environmental_MinimizesPollution": 11.036621173876062,
          "Environmental_UsesResourcesEfficiently": 8.340314546342473,
          "Environmental_UsesSustainableMaterials": 10.408405337288466,
          "Shareholder": 6.3859375631025035,
          "Shareholder_GeneratesReturnForInvestors": 5.787305983629093,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 0.45607120128162765,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 6.772010149516906,
          "Workers": 13.614497108393925,
          "Workers_CultivatesADiverseInclusiveWorkplace": 9.210563236483003,
          "Workers_PaysAFairLivingWage": 8.311868539030202,
          "Workers_ProtectsWorkerHealthAndSafety": 7.323862364239309,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 11.457166994974846,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 7.943134984698178
        },
        "DI_vs_market": {
          "Community": 9.841154483946577,
          "Community_AddressesHumanRightsInSupplyChain": 14.083690483419428,
          "Community_ContributesToCommunityDevelopment": 9.603438514203477,
          "Community_CreatesJobsInTheUS": 5.3315991435598855,
          "Community_GivesBackToLocalCommunities": 4.969636253432562,
          "Customer": 16.200040689029084,
          "Customer_CommunicatesTransparently": 4.622518489617395,
          "Customer_MakesBeneficialProducts": 0.5794274175384265,
          "Customer_ProtectsCustomerPrivacy": 15.610331418189668,
          "Customer_TreatsCustomersFairly": 6.662067837534044,
          "Environmental": 14.465690926977516,
          "Environmental_CombatsClimateChange": 10.40779050423956,
          "Environmental_MinimizesPollution": 12.138181185707776,
          "Environmental_UsesResourcesEfficiently": 9.77034541232746,
          "Environmental_UsesSustainableMaterials": 7.4981080159998585,
          "Shareholder": 9.423548124488587,
          "Shareholder_GeneratesReturnForInvestors": 3.4041891055288236,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 0.5794274175384265,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 7.921405035439946,
          "Workers": 9.912018698142138,
          "Workers_CultivatesADiverseInclusiveWorkplace": 4.969549462551741,
          "Workers_PaysAFairLivingWage": 6.99018409997548,
          "Workers_ProtectsWorkerHealthAndSafety": 2.6535359956266236,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": 7.699969263697256,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 7.961256607160329
        },
        "filtered_vs_market": {
          "Community": 1.9718289655184462,
          "Community_AddressesHumanRightsInSupplyChain": 3.728627075328389,
          "Community_ContributesToCommunityDevelopment": -0.7065627337654402,
          "Community_CreatesJobsInTheUS": 2.4859906297302907,
          "Community_GivesBackToLocalCommunities": -0.9168709851144319,
          "Customer": 6.625506216827645,
          "Customer_CommunicatesTransparently": -0.24590275098991185,
          "Customer_MakesBeneficialProducts": 0.12392138601062233,
          "Customer_ProtectsCustomerPrivacy": 6.040645834768867,
          "Customer_TreatsCustomersFairly": 9.835830135055307,
          "Environmental": -0.2183478488744969,
          "Environmental_CombatsClimateChange": -0.6249276749705212,
          "Environmental_MinimizesPollution": 1.2382173725490768,
          "Environmental_UsesResourcesEfficiently": 1.5601524911494502,
          "Environmental_UsesSustainableMaterials": -1.2821887068629882,
          "Shareholder": 3.244822927574207,
          "Shareholder_GeneratesReturnForInvestors": -1.0675203874942567,
          "Shareholder_ActsEthicallyAtTheLeadershipLevel": 0.12392138601062233,
          "Shareholder_PrioritizesAccountabilityToAllStakeholders": 1.2328860546777993,
          "Workers": -1.6548249342206434,
          "Workers_CultivatesADiverseInclusiveWorkplace": -2.411884945851237,
          "Workers_PaysAFairLivingWage": -0.8669019092544962,
          "Workers_ProtectsWorkerHealthAndSafety": -3.1970607388910195,
          "Workers_ProvidesBenefitsAndWorkLifeBalance": -1.7791564281385337,
          "Workers_SupportsWorkforceRetentionAdvancementAndTraining": 0.019685248307270187
        }
      }
    },
    quantEdit: {
      generatedHtml:
        '<html lang="en">' +
        '' +
        '<head>' +
        '<meta charset="utf-8">' +
        '<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">' +
        '<title>Tearsheet (generated by QuantStats)</title>' +
        '<meta name="robots" content="noindex, nofollow">' +
        '<link rel="shortcut icon" href="https://qtpylib.io/favicon.ico" type="image/x-icon">' +
        '<style>' +
        'body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;margin:30px}body,p,table,td,th{font:13px/1.4 Arial,sans-serif}.container{max-width:960px;margin:auto}img,svg{width:100%}h1,h2,h3,h4{font-weight:400;margin:0}h1 dt{display:inline;margin-left:10px;font-size:14px}h3{margin-bottom:10px;font-weight:700}h4{color:grey}h4 a{color:#09c;text-decoration:none}h4 a:hover{color:#069;text-decoration:underline}hr{margin:25px 0 40px;height:0;border:0;border-top:1px solid #ccc}#left{width:620px;margin-right:18px;margin-top:-1.2rem;float:left}#right{width:320px;float:right}#left svg{margin:-1.5rem 0}#monthly_heatmap{overflow:hidden}#monthly_heatmap svg{margin:-1.5rem 0}table{margin:0 0 40px;border:0;border-spacing:0;width:100%}table td,table th{text-align:right;padding:4px 5px 3px 5px}table th{text-align:right;padding:6px 5px 5px 5px}table td:first-of-type,table th:first-of-type{text-align:left;padding-left:2px}table td:last-of-type,table th:last-of-type{text-align:right;padding-right:2px}td hr{margin:5px 0}table th{font-weight:400}table thead th{font-weight:700;background:#eee}#eoy table td:after{content:"%"}#eoy table td:first-of-type:after,#eoy table td:last-of-type:after,#eoy table td:nth-of-type(4):after{content:""}#eoy table th{text-align:right}#eoy table th:first-of-type{text-align:left}#eoy table td:after{content:"%"}#eoy table td:first-of-type:after,#eoy table td:last-of-type:after{content:""}#ddinfo table td:nth-of-type(3):after{content:"%"}#ddinfo table th{text-align:right}#ddinfo table td:first-of-type,#ddinfo table td:nth-of-type(2),#ddinfo table th:first-of-type,#ddinfo table th:nth-of-type(2){text-align:left}#ddinfo table td:nth-of-type(3):after{content:"%"}' +
        '@media print{hr{margin:25px 0}body{margin:0}.container{max-width:100%;margin:0}#left{width:55%;margin:0}#left svg{margin:0 0 -10%}#left svg:first-of-type{margin-top:-30%}#right{margin:0;width:45%}}' +
        '</style>' +
        '</head>' +
        '' +
        '<body onload="save()">' +
        '' +
        '<div class="container">' +
        '</div>' +
        '<style>*{white-space:auto !important;}</style>' +
        '</body>' +
        '</html>'
    }
  }),
  getters: {
    getQuantEdit(state) {
      return state.quantEdit
    },
    getEsgMetrics(state) {
      return state.esgMetrics
    }
  },
  actions: {
    async fetchEsgMetrics() {
      try {
        this.loading = true
        await axios.get(process.env.VUE_APP_URL_ROOT + "/api/esg/", {withCredentials: true})
          .then((response) => {
            console.log(response)
            if (response.data) {
              this.esgMetrics = response.data;
            }
          });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            console.log("===   Portfolio metrics data not yet available, gives 404 error   ===");
          }
        }
        console.log(error);
      }
    },
    async fetchQuant() {
      try {
        this.loading = true
        await axios.get(process.env.VUE_APP_URL_ROOT + "/api/quant/", {withCredentials: true})
          .then((response) => {
            console.log(response)
            if (response.data) {
              this.submitted = true;
              this.quantEdit = response.data;
            }
          });
      } catch (error) {
        if (error.response) {
          if (error.response.status === 404) {
            console.log("===   Performance data not yet available, gives 404 error   ===");
          }
        }
        console.log(error);
      }
    }
  }
})
