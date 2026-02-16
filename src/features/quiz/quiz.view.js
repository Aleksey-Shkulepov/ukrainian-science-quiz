export class QuizView {
  renderQuestion(question, onRendered) {
    const container = document.getElementById('question-area');
    container.classList.remove('fade-in');
    container.classList.add('fade-out');

    setTimeout(() => {
        let optionsHTML = '';
        let extraHTML = '';

        if (question.type === 'multiple') {
            optionsHTML = question.options.map((opt, i) =>
            `<div class="option multiple" data-index="${i}">${opt}</div>`
            ).join('');
            extraHTML = `<button class="confirm-btn" disabled>Підтвердити вибір</button>`;
        } else if (question.type === 'image' && question.image) {
            optionsHTML = question.options.map((opt, i) =>
            `<div class="option" data-index="${i}">${opt}</div>`
            ).join('');
            extraHTML = `<img src="${question.image}" class="question-image">`;
        } else {
            optionsHTML = question.options.map((opt, i) =>
            `<div class="option" data-index="${i}">${opt}</div>`
            ).join('');
        }

        container.innerHTML = `
        <h3 class="question">${question.q}</h3>
        ${extraHTML}
        <div class="options">${optionsHTML}</div>
        `;

        container.classList.remove('fade-out');
        container.classList.add('fade-in');

        if (onRendered) onRendered();
    }, 220);
  }

  updateProgress(state) {
    const { correct, wrong, partial, pending } = state.stats;
    const total = state.total;

    document.querySelector('.progress-container').innerHTML = `
      <div class="progress-segment progress-correct" style="width:${(correct/total)*100}%"></div>
      <div class="progress-segment progress-partial" style="width:${(partial/total)*100}%"></div>
      <div class="progress-segment progress-wrong" style="width:${(wrong/total)*100}%"></div>
      <div class="progress-segment progress-pending" style="width:${(pending/total)*100}%"></div>
    `;

    document.getElementById('counter').textContent =
      `${state.index + 1} / ${state.total}`;
  }

  showResult(state, retryCallback) {
    const pct = Math.round((state.score / state.total) * 100);
    const grade = pct >= 80 ? 'Відмінно' : pct >= 60 ? 'Добре' : 'Можна краще';

    document.getElementById('quiz-root').innerHTML = `
      <div class="result">
        <h2>Результат: ${state.score} / ${state.total}</h2>
        <p>Процент: ${pct}% — ${grade}</p>
        <button class="btn" onclick="location.href='index.html'">Повернутись на головну</button>
        <button class="btn ghost" id="retryBtn">Пройти ще раз</button>
      </div>
    `;

    document.getElementById('retryBtn').onclick = retryCallback;
  }

  showError(message) {
    document.getElementById('question-area').innerHTML =
      `<p class="error">${message}</p>`;
  }
}
