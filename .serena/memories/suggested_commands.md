# 开发命令

## 开发与运行
- `npm run dev` - 启动开发服务器（Vite + Electron）
- `npm run preview` - 预览构建结果

## 构建
- `npm run build` - TypeScript 编译 + Vite 构建
- `npm run build:win` - 构建 Windows 安装包
- `npm run build:linux` - 构建 Linux 安装包
- `npm run build:mac` - 构建 macOS 安装包

## 系统工具
- `git status` - 查看 Git 状态
- `git diff` - 查看修改
- `git log --oneline -10` - 查看最近提交
- `ls -la` - 列出文件
- `find . -name "*.ts"` - 查找文件
- `grep -r "pattern" src/` - 搜索代码

## 注意事项
- 项目没有配置 ESLint 或 Prettier，代码格式需手动维护
- 项目没有配置测试框架
- 构建产物在 `dist-electron/` 目录
