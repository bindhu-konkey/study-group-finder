import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import tailwindcss from '@tailwindcss/vite'
=======
>>>>>>> 452f9fbde59162178ac32d61d868c05608a7bfaa
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
<<<<<<< HEAD
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
=======
  plugins: [react()],
>>>>>>> 452f9fbde59162178ac32d61d868c05608a7bfaa
})
