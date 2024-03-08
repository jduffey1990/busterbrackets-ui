import { defineStore } from 'pinia';

export const usePortfolioStore = defineStore('portfolio', {
  state: () => ({
    regenerate: false,
    portfolio: undefined,
    portfolioEdit: undefined,
    guidanceTextRisk: ['Very Low', 'Low', 'Medium', 'High', 'Very High'],
    guidanceTextValues: [
      'High Values',
      'Moderate Values',
      'Low Values',
      'Equal',
      'Low Index',
      'Moderate Index',
      'High Index',
    ],
    guidanceTextHorizon: [
      'One Year',
      'Five Years',
      'Ten Years',
      'Fifteen Years',
      'Twenty+ Years',
    ],
    isApproved: false,
  }),
  actions: {
    fetchPortfolioValues() {
      return this.$axios.get('/api/portfolio/values');
    },
    async fetchPortfolio() {
      const {
        data: { full },
      } = await this.$axios('/api/portfolio/');

      if (full) {
        this.regenerate = false;
        this.portfolio = full;
        this.portfolioEdit = full;
      }
    },
  },
});
