const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  globalIgnores(['node_modules/**', '.expo/**', 'ios/**', 'android/**', 'dist/**', 'web-build/**', 'artifacts/**']),
  expoConfig,
  {
    // Report compiler migration work without refactoring unrelated screens in
    // this reliability patch. Rules-of-hooks and other correctness errors stay
    // enforced; these advisory diagnostics remain visible in local/CI output.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
]);
