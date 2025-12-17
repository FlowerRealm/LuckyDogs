/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 现代简约色彩系统
        theme: {
          bg: '#f8fafc',      // 浅灰白背景
          card: '#ffffff',    // 纯白卡片
          primary: '#6366f1', // 靛蓝主色
          success: '#22c55e', // 绿色成功色
          text: {
            main: '#1e293b',  // 深灰主文字
            sub: '#64748b',   // 次要文字
            light: '#94a3b8'  // 浅色占位
          },
          border: '#e2e8f0'   // 边框色
        }
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
      },
      animation: {
        'breathe': 'breathe 2s infinite ease-in-out',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards'
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.02)', opacity: '0.8' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
