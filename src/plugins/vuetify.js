/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

import '@mdi/font/css/materialdesignicons.css'; // Ensure you are using css-loader

// Composables
import {createVuetify} from 'vuetify';

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
                    primary: '#07152A',
                    secondary: '#ffffff',
                    info: '#F9BBA9',
                    warning: '#CF6232',
                    success: '#FCC35B',
                    lightgrey: '#f6f9fc',
                    grayblue: "#677680",
                    error: '#c6414f',
                    translucent: 'rgba(255,255,255,0.2)'
                },
            },
        },
    },
});
