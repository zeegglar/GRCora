module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'supabase/**', 'tests/**'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'no-unused-vars': 'off', // Disable for now to avoid conflicts
    'react/prop-types': 'off', // We use TypeScript for prop validation
    'react/no-unescaped-entities': 'off', // Allow unescaped quotes in JSX
    'react-hooks/exhaustive-deps': 'warn', // Warn instead of error
    'no-case-declarations': 'off', // Allow variable declarations in case blocks
    'prefer-const': 'error',
    'no-var': 'error',
  },
};