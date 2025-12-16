import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default {
  plugins: [
    tailwindcss(resolve(__dirname, 'tailwind.config.js')),
    autoprefixer,
  ],
}
