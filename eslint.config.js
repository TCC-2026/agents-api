import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default [
   {
      ignores: ['src/utils/logger.js']
   },
   js.configs.recommended,
   prettierConfig,
   {
      languageOptions: {
         ecmaVersion: 'latest',
         sourceType: 'module',
         globals: {
            ...globals.node
         }
      },
      rules: {
         'no-unused-vars': 'warn',
         'no-console': 'warn'
      }
   }
];
