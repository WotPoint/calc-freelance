import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Минимальная конфигурация Vite для React-приложения
export default defineConfig({
  plugins: [react()],
});
