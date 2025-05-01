import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname
})

const eslintConfig = [
  ...compat.config({
    extends: ['next'],
    rules: {
      // 禁用未使用变量的警告
      '@typescript-eslint/no-unused-vars': 'off',
      // 禁用 React Hooks 依赖检查
      'react-hooks/exhaustive-deps': 'off',
      // 允许使用 any 类型
      '@typescript-eslint/no-explicit-any': 'off',
      // 允许使用 @ts-ignore 等注释
      '@typescript-eslint/ban-ts-comment': 'off',
      // 允许在 TypeScript 定义中使用 any
      '@typescript-eslint/no-unsafe-assignment': 'off',
      // 类型检查相关规则
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off'
    }
  })
]

export default eslintConfig