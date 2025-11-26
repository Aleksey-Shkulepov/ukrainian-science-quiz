class Quiz {
    constructor() {
        this.questions = [];
        this.state = { index: 0, score: 0, total: 0 };
        this.currentCategory = '';
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
                .map(question => this.shuffleOptions(question))
                .sort(() => Math.random() - 0.5);
            
            this.state.total = this.questions.length;
            this.state.index = 0;
            this.state.score = 0;
            
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
        
        const newCorrectIndex = shuffledOptions.findIndex(
            item => item.originalIndex === question.answer
        );
        
        return {
            ...question,
            options: shuffledOptions.map(item => item.option),
            answer: newCorrectIndex
        };
    }

    updateProgress() {
        const pct = Math.round((this.state.index / this.state.total) * 100);
        const progressBar = document.getElementById('progress-bar');
        const counter = document.getElementById('counter');
        
        if (progressBar) progressBar.style.width = pct + '%';
        if (counter) counter.textContent = `${this.state.index + 1} / ${this.state.total}`;
    }

    renderQuestion() {
        const container = document.getElementById('question-area');
        if (!container) return;

        container.classList.remove('fade-in');
        container.classList.add('fade-out');
        
        setTimeout(() => {
            const question = this.questions[this.state.index];
            const optionsHTML = question.options.map((opt, i) => 
                `<div class="option" onclick="quiz.selectOption(${i})">${opt}</div>`
            ).join('');
            
            container.innerHTML = `
                <h3 class="question">${question.q}</h3>
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
        
        const quizRoot = document.getElementById('quiz-root');
        if (!quizRoot) return;
        
        quizRoot.innerHTML = `
            <div class="meta-row">
                <div class="progress">
                    <div id="progress-bar"></div>
                </div>
                <div id="counter">1 / ${this.state.total}</div>
            </div>
            <div id="question-area" class="question-area"></div>
            <div class="controls"></div>
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