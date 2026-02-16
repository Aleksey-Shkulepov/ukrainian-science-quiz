import { QuizModel } from './quiz.model.js';
import { QuizView } from './quiz.view.js';
import { loadQuestions } from './quiz.service.js';

export class QuizController {
  constructor() {
    this.model = new QuizModel();
    this.view = new QuizView();
    this.locked = false;
  }

  async init(category) {
    try {
      const questions = await loadQuestions(category);
      this.model.setQuestions(questions);
      this.render();
    } catch (e) {
      this.view.showError(`Помилка завантаження: ${e.message}`);
    }
  }

  render() {
    const question = this.model.getCurrentQuestion();
    this.view.renderQuestion(question, () => {
        this.bindEvents();
    });
    this.view.updateProgress(this.model.state);
  }

  bindEvents() {
    document.querySelectorAll('.option').forEach(opt => {
        opt.onclick = () => {
            const q = this.model.getCurrentQuestion();
            const index = +opt.dataset.index;

            if (q.type === 'multiple') {
            opt.classList.toggle('selected');

            const btn = document.querySelector('.confirm-btn');
            if (btn) {
                btn.disabled = document.querySelectorAll('.option.selected').length === 0;
            }
            } else {
            this.onSelect(index);
            }
        };
    });

    const btn = document.querySelector('.confirm-btn');
    if (btn) {
      btn.onclick = () => this.onConfirmMultiple();
    }
  }

  onSelect(index) {
    if (this.locked) return;
    this.locked = true;

    const q = this.model.getCurrentQuestion();
    const options = document.querySelectorAll('.option');

    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.classList.add('disabled');
    });

    options.forEach((opt, i) => {
        if (i === q.answer) opt.classList.add('correct');
        else if (i === index) opt.classList.add('wrong');
    });

    this.model.answerSingle(index);

    setTimeout(() => this.next(), 900);
  }


  onConfirmMultiple() {
    if (this.locked) return;
    this.locked = true;

    const q = this.model.getCurrentQuestion();
    const selected = [...document.querySelectorAll('.option.selected')]
        .map(el => +el.dataset.index);

    const options = document.querySelectorAll('.option');

    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        opt.classList.add('disabled');
    });

    options.forEach((opt, i) => {
        if (q.answer.includes(i)) {
        opt.classList.add('correct');
        } else if (selected.includes(i)) {
        opt.classList.add('wrong');
        }
    });

    this.model.answerMultiple(selected, q.answer);

    setTimeout(() => this.next(), 1200);
  }
  next() {
    this.model.next();
    if (this.model.isFinished()) {
      this.view.showResult(this.model.state, () => this.retry());
    } else {
      this.render();
    }
    this.locked = false;
  }

  retry() {
    this.model.reset();
    location.reload();
  }
}
