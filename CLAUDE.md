# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lucky Dogs (带权重和互斥规则的抽奖程序) is an Electron + React lottery application with weighted random selection and binding rules. The app allows administrators to manage participants with different winning weights and define binding rules that group participants together (when one wins, related participants in the group also win).

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
- **State**: Zustand stores (frontend) + LotteryEngineManager singleton (main process)
- **UI**: Radix UI primitives + Framer Motion animations

### Key Directories
- `electron/` - Electron main process and IPC handlers
  - `main.ts` - Window creation, config loading, IPC registration
  - `preload.ts` - Context bridge for renderer access
  - `ipc/lotteryManager.ts` - Core lottery engine with weighted selection and rule enforcement
  - `ipc/lotteryHandlers.ts` - IPC handlers for lottery operations
- `src/store/` - Zustand stores: `participantStore`, `ruleStore`, `lotteryStore`
- `src/types/` - TypeScript interfaces for `Participant`, `Rule`, `Winner`, `LotteryState`
- `src/components/lottery/` - Lottery UI components (LotteryWheel, FlipCard)
- `config/` - Default JSON data for participants and rules

### Core Classes (electron/ipc/lotteryManager.ts)
- **LotteryEngine** - Performs weighted random selection (`weightedRandomSelect`), manages eligible candidates (`getEligibleCandidates`), and applies binding rules (`applyBindingRules`)
- **LotteryEngineManager** - Singleton that manages the LotteryEngine lifecycle, accessed via `getInstance()`

### Data Flow
1. **Participants** have `id`, `name`, `weight`, and optional `wonAt`/`wonInRound` tracking
2. **Rules** currently support `RuleType.BINDING` - groups participants so they win together
3. **LotteryEngine** (main process) performs weighted selection while enforcing active rules
4. Frontend communicates with main process via IPC (`window.electronAPI`)
5. State persists via Zustand middleware (frontend) and JSON config files (initial data)

### Important Patterns
- Path aliases: `@` → `src/`, `@config` → `config/`
- Electron IPC handlers registered in `electron/main.ts` via `registerIpcHandlers()`
- Lottery engine runs in main process, initialized via `lottery:init`, controlled via `lottery:draw`, `lottery:reset`
- Config files loaded from `config/` in dev, user data directory in production
