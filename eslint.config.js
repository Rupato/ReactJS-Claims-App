import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const commonConfig = {
  languageOptions: {
    ecmaVersion: 2020,
    globals: {
      ...globals.browser,
      process: 'readonly', // Rsbuild injects process in browser
    },
    parserOptions: {
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      sourceType: 'module',
    },
  },
  settings: { react: { version: '19.2.3' } },
  plugins: {
    react,
    'react-hooks': reactHooks,
    'react-refresh': reactRefresh,
  },
  rules: {
    ...js.configs.recommended.rules,
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
    ...reactHooks.configs.recommended.rules,
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
};

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    ...commonConfig,
  },
  {
    files: ['**/*.{ts,tsx}'],
    ...commonConfig,
    languageOptions: {
      ...commonConfig.languageOptions,
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      ...commonConfig.plugins,
    },
    rules: {
      ...commonConfig.rules,
      ...tsPlugin.configs.recommended.rules,
    },
  },
];
