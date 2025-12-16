# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lucky Dogs (带权重和互斥规则的抽奖程序) is an Electron + React lottery application with weighted random selection and mutual exclusion rules. The app allows administrators to manage participants with different winning weights and define rules that prevent certain participants from winning together.

## Development Commands

```bash
npm run dev          # Start development server with hot reload
npm run build        # TypeScript compile + Vite build
npm run preview      # Preview production build

# Platform-specific builds
npm run build:win    # Build for Windows
npm run build:linux  # Build for Linux
npm run build:mac    # Build for macOS
```

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Desktop**: Electron 28 with Vite plugin integration
- **State**: Zustand stores with persistence
- **UI**: Radix UI primitives + Framer Motion animations

### Key Directories
- `electron/` - Electron main process (`main.ts`) and preload script (`preload.ts`)
- `src/services/lotteryEngine.ts` - Core lottery logic with weighted selection and rule enforcement
- `src/store/` - Zustand stores: `participantStore`, `ruleStore`, `lotteryStore`
- `src/types/` - TypeScript interfaces for `Participant`, `Rule`, `LotterySession`
- `config/` - Default JSON data for participants and rules
- `build/` - Build configs (electron-builder, tailwind, postcss)

### Data Flow
1. **Participants** have `id`, `name`, and `weight` (higher weight = higher chance)
2. **Rules** define mutual exclusion groups (e.g., spouses can't both win)
3. **LotteryEngine** performs weighted random selection while enforcing active rules
4. State persists via Zustand middleware

### Important Patterns
- Path aliases: `@` → `src/`, `@config` → `config/`
- Electron IPC is configured in `electron/main.ts` via `registerIpcHandlers()`
- Config files are loaded from `config/` in dev, user data directory in production
