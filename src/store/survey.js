import { defineStore } from 'pinia';
import { usePortfolioStore } from '@/store/portfolio';

export const useSurveyStore = defineStore('survey', {
  state: () => ({
    survey: {},
    surveyEdit: {
      isSubmitted: false,
      riskTolerance: 0,
      valuesVsTracking: 0,
      timeHorizon: 0,
      includedCompanies: [],
      prioritize: {
        environmentalImpact: {
          name: 'Environmental Impact',
          items: [
            {
              tag: 'minimizesPollution',
              name: 'Minimizes Pollution',
              value: false,
            },
            {
              tag: 'usesResourcesEfficiently',
              name: 'Uses Resources Efficiently',
              value: false,
            },
            {
              tag: 'usesSustainableMaterials',
              name: 'Uses Sustainable Materials',
              value: false,
            },
            {
              tag: 'combatsClimateChange',
              name: 'Combats Climate Change',
              value: false,
            },
          ],
        },
        employeesAndLaborRelations: {
          name: 'Employees and Labor Relations',
          items: [
            {
              tag: 'paysAFairLivingWageIncludingBenefits',
              name: 'Pays a Fair Living Wage Including Benefits',
              value: false,
            },
            {
              tag: 'protectsWorkerHealthAndSafety',
              name: 'Protects Worker Health and Safety',
              value: false,
            },
            {
              tag: 'supportsWorkforceTrainingRetentionAndAdvancement',
              name: 'Supports Workforce Training, Retention, and Advancement',
              value: false,
            },
            {
              tag: 'cultivatesADiverseAndInclusiveWorkingEnvironment',
              name: 'Cultivates a Diverse and Inclusive Working Environment',
              value: false,
            },
          ],
        },
        businessPracticesAndLeadership: {
          name: 'Business Practices and Leadership',
          items: [
            {
              tag: 'responsiblyManagesSupplyChain',
              name: 'Responsibly Manages Supply Chain',
              value: false,
            },
            {
              tag: 'actsEthicallyAtTheLeadershipLevel',
              name: 'Acts Ethically at the Leadership Level',
              value: false,
            },
            {
              tag: 'communicatesTransparently',
              name: 'Communicates Transparently',
              value: false,
            },
            {
              tag: 'hasAFairlyPaidAndDiverseLeadershipTeam',
              name: 'Accountable to All Stakeholders',
              value: false,
            },
          ],
        },
        customerProductAndResponsibility: {
          name: 'Customer Product and Responsibility',
          items: [
            {
              tag: 'protectsCustomerPrivacyAndDataSecurity',
              name: 'Protects Customer Privacy and Data Security',
              value: false,
            },
            {
              tag: 'treatsCustomersFairly',
              name: 'Treats Customers Fairly',
              value: false,
            },
            {
              tag: 'emphasizesProductQualityAndSafety',
              name: 'Produces Products Beneficial to Society',
              value: false,
            },
            {
              tag: 'practicesTransparentAndHonestAdvertisingAndLabeling',
              name: 'Practices Transparent and Honest Advertising and Labeling',
              value: false,
            },
          ],
        },
        communityAndSocialImpact: {
          name: 'Community and Social Impact',
          items: [
            {
              tag: 'contributesToCommunityDevelopment',
              name: 'Contributes to Community Development',
              value: false,
            },
            {
              tag: 'givesBackToLocalCommunities',
              name: 'Gives Back to Local Communities',
              value: false,
            },
            {
              tag: 'mitigatesThePhysicalImpactsOfClimateChange',
              name: 'Mitigates the Physical Impacts of Climate Change',
              value: false,
            },
            {
              tag: 'protectsHumanRights',
              name: 'Address human rights in their supply chain',
              value: false,
            },
            {
              tag: 'createsJobsInTheUS',
              name: 'Creates Jobs in the US',
              value: false,
            },
          ],
        },
      },
      excludedCompanies: [],
      avoidInvestingInSpecificProductsAndOperations: {
        categories: [
          { tag: 'abortion', name: 'Abortion', value: false },
          {
            tag: 'adultEntertainment',
            name: 'Adult Entertainment',
            value: false,
          },
          {
            tag: 'alcoholProduction',
            name: 'Alcoholic Beverages - Production',
            value: false,
          },
          {
            tag: 'alcoholRetail',
            name: 'Alcoholic Beverages - Retail Sales',
            value: false,
          },
          {
            tag: 'alcoholRelated',
            name: 'Alcoholic Beverages - Related Products/Services',
            value: false,
          },
          {
            tag: 'animalTestingPharma',
            name: 'Animal Testing for Pharmaceuticals',
            value: false,
          },
          {
            tag: 'animalTestingNonPharma',
            name: 'Animal Testing for Non-Pharmaceuticals',
            value: false,
          },
          {
            tag: 'cannabisRecreational',
            name: 'Cannabis for Recreational Purposes',
            value: false,
          },
          {
            tag: 'cannabisMedical',
            name: 'Cannabis for Medical Purposes',
            value: false,
          },
          {
            tag: 'fossilFuelsCoalExtraction',
            name: 'Fossil Fuels - Coal Extraction',
            value: false,
          },
          {
            tag: 'fossilFuelsCoalPower',
            name: 'Fossil Fuels - Coal Power',
            value: false,
          },
          {
            tag: 'fossilFuelsOilExploration',
            name: 'Fossil Fuels - Arctic Oil and Gas Exploration',
            value: false,
          },
          {
            tag: 'fossilFuelsOilPower',
            name: 'Fossil Fuels - Oil and Gas Power',
            value: false,
          },
          {
            tag: 'fossilFuelsOilProduction',
            name: 'Fossil Fuels - Oil and Gas Production',
            value: false,
          },
          {
            tag: 'fossilFuelsOilSandsExtraction',
            name: 'Fossil Fuels - Oil Sands Extraction',
            value: false,
          },
          {
            tag: 'fossilFuelsProductsServices',
            name: 'Fossil Fuels - Products and Services',
            value: false,
          },
          {
            tag: 'fossilFuelsShaleFracking',
            name: 'Fossil Fuels - Shale Fracking Extraction',
            value: false,
          },
          {
            tag: 'furLeather',
            name: 'Fur and Specialty Leather',
            value: false,
          },
          { tag: 'gambling', name: 'Gambling', value: false },
          { tag: 'gmoCrops', name: 'GMO Crops', value: false },
          {
            tag: 'gmoDevelopment',
            name: 'GMO Development and Research',
            value: false,
          },
          {
            tag: 'humanEmbryonicFetalStemCellsUse',
            name: 'Human Fetal Stem Cell Use',
            value: false,
          },
          {
            tag: 'humanEmbryonicStemCellsResearch',
            name: 'Human Stem Cell Research',
            value: false,
          },
          {
            tag: 'humanEmbryonicStemCellsUse',
            name: 'Human Embryonic Cell Use',
            value: false,
          },
          {
            tag: 'militaryWeapon',
            name: 'Military - Weapon Related',
            value: false,
          },
          {
            tag: 'militaryNonWeapon',
            name: 'Military - Non-Weapon Related',
            value: false,
          },
          { tag: 'nuclearPower', name: 'Nuclear Power', value: false },
          { tag: 'palmOil', name: 'Palm Oil', value: false },
          { tag: 'pesticides', name: 'Pesticides', value: false },
          { tag: 'pork', name: 'Pork Products', value: false },
          {
            tag: 'predatoryLending',
            name: 'Predatory Lending\n',
            value: false,
          },
          { tag: 'socialMedia', name: 'Social Media Platforms', value: false },
          { tag: 'tobaccoProducts', name: 'Tobacco - Products', value: false },
          {
            tag: 'tobaccoRetail',
            name: 'Tobacco - Retails Sales',
            value: false,
          },
          {
            tag: 'weaponsAssault',
            name: 'Weapons - Assault Weapons',
            value: false,
          },
          {
            tag: 'weaponsControversial',
            name: 'Weapons - Controversial Weapons',
            value: false,
          },
          {
            tag: 'weaponsComponents',
            name: 'Weapons - Key Components',
            value: false,
          },
          {
            tag: 'weaponsMilitaryLaw',
            name: 'Weapons - Military and Law Enforcement',
            value: false,
          },
          {
            tag: 'weaponsNonAssault',
            name: 'Weapons - Non-Assault Weapons',
            value: false,
          },
        ],
      },
      industryExclusions: {
        categories: [
          { tag: 'aerospace', name: 'Aerospace', value: false },
          {
            tag: 'automobilesAndParts',
            name: 'Automobiles and Parts',
            value: false,
          },
          { tag: 'banks', name: 'Banks', value: false },
          {
            tag: 'buildingMaterialsConstruction',
            name: 'Building Materials and Construction',
            value: false,
          },
          { tag: 'basicResources', name: 'Basic Resources', value: false },
          { tag: 'capitalMarkets', name: 'Captial Markets', value: false },
          { tag: 'chemicals', name: 'Chemicals', value: false },
          { tag: 'clothing', name: 'Clothing and Accessories', value: false },
          {
            tag: 'commercialSupportServices',
            name: 'Commercial Support Services',
            value: false,
          },
          {
            tag: 'commercialVehiclesMachinery',
            name: 'Commerical Vehicles and Machinery',
            value: false,
          },
          { tag: 'computerServices', name: 'Computer Services', value: false },
          {
            tag: 'consumerDiversifiedFinance',
            name: 'Consumer and Diversified Finance',
            value: false,
          },
          { tag: 'consumerServices', name: 'Consumer Services', value: false },
          {
            tag: 'energyEquipmentServices',
            name: 'Energy Equipment and Services',
            value: false,
          },
          {
            tag: 'foodBeverageTobacco',
            name: 'Food, Beverage, Tobacco',
            value: false,
          },
          {
            tag: 'foodDrugRetailers',
            name: 'Food and Drug Retailers',
            value: false,
          },
          {
            tag: 'healthCareProviders',
            name: 'Healthcare Providers',
            value: false,
          },
          {
            tag: 'householdLeisureGoods',
            name: 'Household and Leisure Goods',
            value: false,
          },
          { tag: 'industrialGoods', name: 'Industrial Goods', value: false },
          { tag: 'insurance', name: 'Insurance', value: false },
          { tag: 'internet', name: 'Internet', value: false },
          { tag: 'media', name: 'Media', value: false },
          {
            tag: 'medicalEquipmentServices',
            name: 'Medical Equipment and Services',
            value: false,
          },
          { tag: 'oilGas', name: 'Oil and Gas', value: false },
          { tag: 'personalProducts', name: 'Personal Products', value: false },
          {
            tag: 'pharmaceuticalsBiotech',
            name: 'Pharmaceuticals and Biotech',
            value: false,
          },
          { tag: 'realEstate', name: 'Real Estate', value: false },
          {
            tag: 'restaurantsLeisure',
            name: 'Restaurants and Leisure',
            value: false,
          },
          { tag: 'retail', name: 'Retail', value: false },
          {
            tag: 'semiconductorsEquipment',
            name: 'Semiconductors and Equipment',
            value: false,
          },
          { tag: 'software', name: 'Software', value: false },
          {
            tag: 'technologyHardware',
            name: 'Technology Hardware',
            value: false,
          },
          {
            tag: 'telecommunications',
            name: 'Telecommunications',
            value: false,
          },
          {
            tag: 'transactionProcessing',
            name: 'Transaction Processing',
            value: false,
          },
          { tag: 'transportation', name: 'Transportation', value: false },
          { tag: 'utilities', name: 'Utilities', value: false },
        ],
      },
    },
  }),
  actions: {
    isNotEmpty(section) {
      if (section === 'includedCompanies') {
        if (this.surveyEdit.includedCompanies.length > 0) {
          return true;
        }
        return false;
      }

      if (section === 'excludedCompanies') {
        if (this.surveyEdit.excludedCompanies.length > 0) {
          return true;
        }
        return false;
      }

      let notEmpty = false;

      if (section === 'prioritize') {
        Object.values(this.surveyEdit.prioritize).forEach((val) => {
          Object.values(val).forEach((item) => {
            if (item.value) {
              notEmpty = true;
            }
          });
        });
      }
      if (section === 'prioritize.environmentalImpact') {
        Object.values(
          this.surveyEdit.prioritize.environmentalImpact.items
        ).forEach((item) => {
          if (item.value) {
            notEmpty = true;
          }
        });
      }
      if (section === 'prioritize.employeesAndLaborRelations') {
        Object.values(
          this.surveyEdit.prioritize.employeesAndLaborRelations.items
        ).forEach((item) => {
          if (item.value) {
            notEmpty = true;
          }
        });
      }
      if (section === 'prioritize.businessPracticesAndLeadership') {
        Object.values(
          this.surveyEdit.prioritize.businessPracticesAndLeadership.items
        ).forEach((item) => {
          if (item.value) {
            notEmpty = true;
          }
        });
      }
      if (section === 'prioritize.customerProductAndResponsibility') {
        Object.values(
          this.surveyEdit.prioritize.customerProductAndResponsibility.items
        ).forEach((item) => {
          if (item.value) {
            notEmpty = true;
          }
        });
      }

      if (section === 'avoidInvestingInSpecificProductsAndOperations') {
        Object.values(
          this.surveyEdit.avoidInvestingInSpecificProductsAndOperations
            .categories
        ).forEach((item) => {
          if (item.value) {
            notEmpty = true;
          }
        });
      }

      if (section === 'industryExclusions') {
        Object.values(this.surveyEdit.industryExclusions.categories).forEach(
          (item) => {
            if (item.value) {
              notEmpty = true;
            }
          }
        );
      }

      return notEmpty;
    },
    async submitSurvey() {
      this.surveyEdit.isSubmitted = false;

      try {
        await this.$axios.post('/api/survey/', this.surveyEdit);
        this.surveyEdit.isSubmitted = true;
        usePortfolioStore().regenerate = true;
      } catch (error) {}
    },
    async fetchSurvey() {
      try {
        const { data } = await this.$axios.get('/api/survey/');

        if (data) {
          this.submitted = true;
          this.survey = data;
          this.surveyEdit = { ...this.survey };
        }
      } catch (error) {}
    },
  },
});
