import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: [
        'src/store/slices/notificationSlice.ts',
        'src/services/api.ts',
        'src/services/socketService.ts',
        'src/hooks/useAuth.tsx',
        'src/hooks/useRealTimeNotifications.ts',
        'src/components/Header.tsx',
        'src/components/Sidebar.tsx'
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    }
  }
});
