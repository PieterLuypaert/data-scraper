const js = require('@eslint/js');
const globals = require('globals');
const reactHooks = require('eslint-plugin-react-hooks');

module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // Backend (CommonJS, Node)
  {
    files: ['server/**/*.js', 'server.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_|^next$', varsIgnorePattern: '^_' }],
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Stylistic / opinionated rules that flag pre-existing patterns without
      // indicating bugs — kept off so lint stays signal-rich.
      'preserve-caught-error': 'off',
    },
  },

  // Puppeteer evaluate() callbacks run in the browser — allow DOM globals.
  {
    files: ['server/scrapers/puppeteerScraper.js'],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },

  // Tests (CommonJS + Vitest globals)
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
    },
  },

  // Frontend (ESM, browser + React)
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Use only the two classic, high-signal hook rules (the v7 "recommended"
      // set adds many compiler-style rules that flood legacy code with noise).
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'preserve-caught-error': 'off',
      'no-useless-assignment': 'warn',
    },
  },

  // Vite/build config files (Node ESM)
  {
    files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: { ...js.configs.recommended.rules },
  },
];
