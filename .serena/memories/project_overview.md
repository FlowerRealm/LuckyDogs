# Lucky Dogs - 项目概述

## 项目目的
Lucky Dogs 是一个带权重和互斥规则的抽奖程序，使用 Electron 作为桌面应用框架。

## 技术栈
- **前端框架**: React 18 + TypeScript
- **桌面框架**: Electron 28
- **构建工具**: Vite 5
- **样式**: Tailwind CSS 3
- **状态管理**: Zustand
- **动画**: Framer Motion
- **UI 组件**: Radix UI (Tabs, Dialog, Select, Switch)
- **图标**: Lucide React

## 项目结构
```
├── src/
│   ├── components/       # React 组件
│   │   ├── common/       # 通用组件
│   │   ├── lottery/      # 抽奖相关组件 (LotteryWheel, FlipCard)
│   │   └── management/   # 管理相关组件 (ParticipantList, RuleList)
│   ├── pages/            # 页面组件
│   ├── store/            # Zustand 状态管理
│   │   ├── lotteryStore.ts
│   │   ├── participantStore.ts
│   │   └── ruleStore.ts
│   ├── types/            # TypeScript 类型定义
│   │   ├── participant.ts
│   │   ├── lottery.ts
│   │   └── rule.ts
│   ├── services/         # 服务层
│   ├── hooks/            # 自定义 React hooks
│   ├── styles/           # 样式文件
│   ├── App.tsx           # 应用入口组件
│   └── main.tsx          # React 入口
├── electron/
│   ├── main.ts           # Electron 主进程
│   ├── preload.ts        # 预加载脚本
│   └── ipc/              # IPC 通信
├── config/               # 配置文件
├── build/                # 构建配置
└── resources/            # 静态资源
```

## 核心功能
- 参与者管理（支持权重设置）
- 抽奖规则配置（支持互斥规则）
- 抽奖轮次和会话管理
- 中奖者记录和展示
