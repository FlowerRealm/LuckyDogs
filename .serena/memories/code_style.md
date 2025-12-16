# 代码风格与约定

## TypeScript 配置
- 目标: ES2020
- 严格模式: 启用 (`strict: true`)
- 禁止未使用的变量和参数
- JSX 模式: react-jsx

## 路径别名
- `@/*` -> `src/*`
- `@config/*` -> `config/*`

## 代码风格
- 使用函数组件（Function Components）
- 使用 TypeScript interface 定义类型
- 注释使用中文
- 组件文件使用 PascalCase 命名（如 `LotteryWheel.tsx`）
- Store 文件使用 camelCase 命名（如 `lotteryStore.ts`）
- 类型文件使用 camelCase 命名（如 `participant.ts`）

## 类型定义示例
```typescript
// 使用 interface 定义类型
export interface Participant {
  id: string
  name: string
  weight: number // 权重 1-100，默认 1
  avatar?: string
  wonAt?: string
  wonInRound?: number
  metadata?: Record<string, any>
}
```

## 状态管理
- 使用 Zustand 进行状态管理
- Store 使用 `use[Name]Store` 命名约定
- Store 导出为命名导出

## 组件结构
- 使用 React Router 进行路由管理
- 组件按功能分组（common, lottery, management）
- 每个功能目录有 index.ts 导出文件
