import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ukrainian-science-quiz/',
  root: '.',
  server: {
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        about: 'about.html',
        quiz: 'quiz.html'
      }
    }
  }
});