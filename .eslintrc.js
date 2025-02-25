module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:import/recommended', 'plugin:import/typescript'],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-useless-constructor': 'off',
        '@typescript-eslint/ban-types': 'off',
        'import/no-anonymous-default-export': 'off',
        'import/namespace': [
          'error',
          {
            allowComputed: true,
          },
        ],
        'no-unused-vars': 'off',
        'no-shadow': 'off',
        'no-undef': 'off',
        curly: ['error', 'multi-line', 'consistent'],
        'no-sparse-arrays': 'error',
        'no-extra-semi': 'error',
        'no-empty': 'error',
        'no-duplicate-case': 'error',
        'no-dupe-keys': 'error',
        'no-unreachable': 'error',
        'no-var': 'error',
        'prefer-const': 'warn',
        'no-const-assign': 'error',
        'import/order': [
          'error',
          {
            groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
            pathGroups: [
              {
                pattern: 'react-native',
                group: 'external',
                position: 'before',
              },
              {
                pattern: 'react',
                group: 'external',
                position: 'before',
              },
              {
                pattern: '@lego*',
                group: 'external',
                position: 'before',
              },
            ],
            pathGroupsExcludedImportTypes: ['react'],
            'newlines-between': 'always',
            alphabetize: {
              order: 'asc',
              caseInsensitive: true,
            },
          },
        ],
      },
    },
  ],
};