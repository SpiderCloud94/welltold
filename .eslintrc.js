/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'react', 'react-hooks'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:react/recommended',
    ],
    settings: { react: { version: 'detect' } },
    ignorePatterns: ['dist', 'build', '.expo', 'android', 'ios', 'node_modules'],
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    overrides: [
      {
        files: ['app/(public)/onboarding/**'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['firebase/firestore', '@react-native-firebase/firestore'],
                  message: 'Do NOT use Firestore in onboarding.',
                },
              ],
            },
          ],
        },
      },
    ],
  };
  