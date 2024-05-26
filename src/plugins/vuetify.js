/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader

// Composables
import { createVuetify } from 'vuetify';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  defaults: {
    global: {
      hideDetails: 'auto',
    },
    VCheckbox: {
      color: 'primary',
      density: 'compact',
      style: {},
    },
    VExpansionPanelTitle: {
      color: 'lightgrey',
    },
    VTextarea: {
      color: 'primary',
    },
    VTextField: {
      color: 'primary',
    },
  },
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          info: '#5CBBF6',
          success: '#41C676',
          lightgrey: '#f6f9fc',
          error: '#c6414f',
        },
      },
    },
  },
});
