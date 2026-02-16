import { QuizController } from './features/quiz/quiz.controller.js';
import './styles/main.scss';

document.addEventListener('DOMContentLoaded', () => {
  const quizRoot = document.getElementById('quiz-root');
  if (!quizRoot) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category');

  if (!category) return;

  const quiz = new QuizController();
  quiz.init(category);
});