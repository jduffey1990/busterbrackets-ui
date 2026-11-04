// ESLint for a Vue 3 + Vite app. The repo shipped `npm run lint` with no
// config, which made ESLint parse everything as ES5 and fail on its own
// config files; this is the minimal setup that lints what is actually here.
module.exports = {
  root: true,
  env: { browser: true, node: true, es2022: true },
  extends: ['eslint:recommended', 'plugin:vue/vue3-essential'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  ignorePatterns: ['dist/', 'node_modules/'],
  rules: {
    'vue/multi-word-component-names': 'off',
  },
};
