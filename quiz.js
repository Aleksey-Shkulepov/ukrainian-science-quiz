class Quiz {
    constructor() {
        this.questions = [];
        this.state = { 
            index: 0, 
            score: 0, 
            total: 0,
            stats: { correct: 0, wrong: 0, pending: 0 }
        };
        this.currentCategory = '';
        this.selectedMultiple = new Set();
        this.currentQuestionType = 'single';
    }

    async init(category) {
        try {
            this.currentCategory = category;
            const response = await fetch(`categories/${category}.json`);
            
            if (!response.ok) throw new Error('Category not found');
            
            let questions = await response.json();
            
            if (!questions || !questions.length) {
                throw new Error('No questions found');
            }

            this.questions = questions
                .map(question => {
                    const type = question.type || 'single';
                    return { ...question, type };
                })
                .map(question => this.shuffleOptions(question))
                .sort(() => Math.random() - 0.5);
            
            this.state.total = this.questions.length;
            this.state.index = 0;
            this.state.score = 0;
            this.updateStats();
            
            this.renderQuestion();
            this.updateProgress();
            
        } catch (error) {
            this.showError(`Помилка завантаження: ${error.message}`);
        }
    }

    shuffleOptions(question) {
        const shuffledOptions = question.options
            .map((option, index) => ({ option, originalIndex: index }))
            .sort(() => Math.random() - 0.5);
        
        if (question.type === 'multiple') {
            const newCorrectIndices = question.answer.map(originalIndex =>
                shuffledOptions.findIndex(item => item.originalIndex === originalIndex)
            ).sort((a, b) => a - b);
            
            return {
                ...question,
                options: shuffledOptions.map(item => item.option),
                answer: newCorrectIndices,
                type: 'multiple'
            };
        } else {
            const newCorrectIndex = shuffledOptions.findIndex(
                item => item.originalIndex === question.answer
            );
            
            return {
                ...question,
                options: shuffledOptions.map(item => item.option),
                answer: newCorrectIndex,
                type: question.type
            };
        }
    }

    updateStats() {
        const correct = this.state.score;
        const wrong = this.state.index - correct;
        const pending = this.state.total - this.state.index;
        
        this.state.stats = { correct, wrong, pending };
    }

    updateProgress() {
        this.updateStats();
        const stats = this.state.stats;
        const total = this.state.total;
        
        const correctWidth = (stats.correct / total) * 100;
        const wrongWidth = (stats.wrong / total) * 100;
        const pendingWidth = (stats.pending / total) * 100;
        
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.innerHTML = `
                <div class="progress-segment progress-correct" style="width: ${correctWidth}%"></div>
                <div class="progress-segment progress-wrong" style="width: ${wrongWidth}%"></div>
                <div class="progress-segment progress-pending" style="width: ${pendingWidth}%"></div>
            `;
        }
        
        const counter = document.getElementById('counter');
        if (counter) {
            counter.textContent = `${this.state.index + 1} / ${this.state.total}`;
        }
    }

    renderQuestion() {
        const container = document.getElementById('question-area');
        if (!container) return;

        container.classList.remove('fade-in');
        container.classList.add('fade-out');
        
        setTimeout(() => {
            const question = this.questions[this.state.index];
            this.currentQuestionType = question.type;
            this.selectedMultiple.clear();
            
            let optionsHTML = '';
            let extraHTML = '';
            
            if (question.type === 'multiple') {
                optionsHTML = question.options.map((opt, i) => `
                    <label class="option multiple" onclick="quiz.toggleMultiple(${i})">
                        <input type="checkbox" data-index="${i}" style="display: none;">
                        <span class="checkbox-custom"></span>
                        <span class="option-text">${opt}</span>
                    </label>
                `).join('');
                extraHTML = `<button class="confirm-btn" onclick="quiz.checkMultiple()" disabled>Підтвердити вибір</button>`;
            } else if (question.type === 'image' && question.image) {
                optionsHTML = question.options.map((opt, i) => 
                    `<div class="option" onclick="quiz.selectOption(${i})">${opt}</div>`
                ).join('');
                extraHTML = `<img src="${question.image}" alt="Зображення" class="question-image">`;
            } else {
                optionsHTML = question.options.map((opt, i) => 
                    `<div class="option" onclick="quiz.selectOption(${i})">${opt}</div>`
                ).join('');
            }
            
            container.innerHTML = `
                <h3 class="question">${question.q}</h3>
                ${extraHTML}
                <div class="options">${optionsHTML}</div>
            `;
            
            container.classList.remove('fade-out');
            container.classList.add('fade-in');
            this.updateProgress();
        }, 220);
    }

    selectOption(selectedIndex) {
        const question = this.questions[this.state.index];
        const options = document.querySelectorAll('.option');
        
        options.forEach((option, index) => {
            option.style.pointerEvents = 'none';
            if (index === question.answer) option.classList.add('correct');
            if (index === selectedIndex && index !== question.answer) option.classList.add('wrong');
        });
        
        if (selectedIndex === question.answer) this.state.score++;
        
        setTimeout(() => {
            this.state.index++;
            if (this.state.index < this.state.total) {
                this.renderQuestion();
            } else {
                this.showResult();
            }
        }, 800);
    }

    toggleMultiple(index) {
        const checkbox = document.querySelector(`input[data-index="${index}"]`);
        const label = checkbox.closest('.option');
        
        if (this.selectedMultiple.has(index)) {
            this.selectedMultiple.delete(index);
            checkbox.checked = false;
            label.classList.remove('selected');
        } else {
            this.selectedMultiple.add(index);
            checkbox.checked = true;
            label.classList.add('selected');
        }
        
        const confirmBtn = document.querySelector('.confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = this.selectedMultiple.size === 0;
        }
    }

    checkMultiple() {
        const question = this.questions[this.state.index];
        const options = document.querySelectorAll('.option');
        const selected = Array.from(this.selectedMultiple).sort((a, b) => a - b);
        const correct = question.answer.sort((a, b) => a - b);
        
        let isCorrect = selected.length === correct.length;
        if (isCorrect) {
            for (let i = 0; i < selected.length; i++) {
                if (selected[i] !== correct[i]) {
                    isCorrect = false;
                    break;
                }
            }
        }
        
        options.forEach((option, index) => {
            option.style.pointerEvents = 'none';
            if (correct.includes(index)) {
                option.classList.add('correct');
            }
            if (selected.includes(index) && !correct.includes(index)) {
                option.classList.add('wrong');
            }
        });
        
        const hasWrong = selected.some(idx => !correct.includes(idx));
        const hasAllCorrect = correct.every(idx => selected.includes(idx));
        const isPartial = !hasWrong && !hasAllCorrect && selected.length > 0;
        
        if (isCorrect) {
            this.state.score++;
        } else if (isPartial) {
            this.markPartialProgress();
        }
        
        setTimeout(() => {
            this.state.index++;
            if (this.state.index < this.state.total) {
                this.renderQuestion();
            } else {
                this.showResult();
            }
        }, 1000);
    }

    markPartialProgress() {
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            const partialSegment = document.createElement('div');
            partialSegment.className = 'progress-segment progress-partial';
            partialSegment.style.width = (1 / this.state.total * 100) + '%';
            progressContainer.appendChild(partialSegment);
        }
    }

    showResult() {
        const pct = Math.round((this.state.score / this.state.total) * 100);
        const grade = pct >= 80 ? 'Відмінно' : pct >= 60 ? 'Добре' : 'Можна краще';
        
        const quizRoot = document.getElementById('quiz-root');
        if (!quizRoot) return;
        
        quizRoot.innerHTML = `
            <div class="result">
                <h2>Результат: ${this.state.score} / ${this.state.total}</h2>
                <p>Процент: ${pct}% — ${grade}</p>
                <div style="margin-top:12px">
                    <button class="btn" onclick="location.href='index.html'">Повернутись на головну</button>
                    <button class="btn ghost" onclick="quiz.retry()">Пройти ще раз</button>
                </div>
            </div>
        `;
    }

    retry() {
        this.questions = this.questions
            .map(question => this.shuffleOptions(question))
            .sort(() => Math.random() - 0.5);
        
        this.state.index = 0;
        this.state.score = 0;
        this.selectedMultiple.clear();
        this.updateStats();
        
        const quizRoot = document.getElementById('quiz-root');
        if (!quizRoot) return;
        
        quizRoot.innerHTML = `
            <div class="meta-row">
                <div class="progress-container">
                    <div class="progress-segment progress-correct" style="width: 0%"></div>
                    <div class="progress-segment progress-wrong" style="width: 0%"></div>
                    <div class="progress-segment progress-pending" style="width: 100%"></div>
                </div>
                <div id="counter">1 / ${this.state.total}</div>
            </div>
            <div id="question-area" class="question-area"></div>
        `;
        
        this.renderQuestion();
    }

    showError(message) {
        const container = document.getElementById('question-area');
        if (container) {
            container.innerHTML = `<p class="error">${message}</p>`;
        }
    }
}

const quiz = new Quiz();