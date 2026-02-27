import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1', // явный IP вместо 'localhost' — работает под VPN
    port: 5173,
    strictPort: true,  // если 5173 занят — упасть с ошибкой, а не взять другой порт
    open: true,        // Vite сам откроет браузер с адресом 127.0.0.1 (работает под VPN)
  },
});
