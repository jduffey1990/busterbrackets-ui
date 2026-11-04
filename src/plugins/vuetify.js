/**
 * plugins/vuetify.js
 *
 * The "arena" theme. The same tokens are exposed as CSS custom properties
 * on :root in assets/scss/misc.scss; change both together.
 */

import '@mdi/font/css/materialdesignicons.css';

import {createVuetify} from 'vuetify';

export default createVuetify({
    defaults: {
        global: {
            hideDetails: 'auto',
        },
        VBtn: {
            rounded: 'lg',
        },
        VCard: {
            rounded: 'lg',
            variant: 'flat',
        },
        VCheckbox: {
            color: 'primary',
            density: 'compact',
        },
        VChip: {
            rounded: 'pill',
        },
        VTextarea: {
            color: 'primary',
            variant: 'outlined',
        },
        VTextField: {
            color: 'primary',
            variant: 'outlined',
        },
        VSelect: {
            color: 'primary',
            variant: 'outlined',
        },
        VAutocomplete: {
            color: 'primary',
            variant: 'outlined',
        },
    },
    icons: {
        defaultSet: 'mdi',
    },
    theme: {
        defaultTheme: 'arena',
        themes: {
            arena: {
                dark: true,
                colors: {
                    background: '#0B1526',
                    'on-background': '#F4F1EA',
                    surface: '#142440',
                    'on-surface': '#F4F1EA',
                    'surface-variant': '#1B2F52',
                    'on-surface-variant': '#F4F1EA',
                    // One accent. `warning` is kept equal to `primary` because
                    // the existing call-to-action buttons use color="warning".
                    primary: '#FF6801',
                    'on-primary': '#0B1526',
                    warning: '#FF6801',
                    'on-warning': '#0B1526',
                    secondary: '#9FB0C8',
                    'on-secondary': '#0B1526',
                    // Gold: upsets, credits, confirmations.
                    success: '#FFC24B',
                    'on-success': '#0B1526',
                    // The boosted-team signal, nothing else.
                    info: '#28F6F4',
                    'on-info': '#0B1526',
                    error: '#FF6B6B',
                    'on-error': '#0B1526',
                },
            },
        },
    },
});
