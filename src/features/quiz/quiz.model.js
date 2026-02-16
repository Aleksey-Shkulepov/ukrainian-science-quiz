export class QuizModel {
  constructor() {
    this.questions = [];
    this.state = { 
      index: 0, 
      score: 0, 
      total: 0,
      partialCount: 0,
      stats: { correct: 0, wrong: 0, partial: 0, pending: 0 }
    };
    this.selectedMultiple = new Set();
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
        type: question.type || 'single'
      };
    }
  }

  setQuestions(questions) {
    this.questions = questions
      .map(q => ({ ...q, type: q.type || 'single' }))
      .map(q => this.shuffleOptions(q))
      .sort(() => Math.random() - 0.5);

    this.state.total = this.questions.length;
    this.state.index = 0;
    this.state.score = 0;
    this.state.partialCount = 0;
    this.updateStats();
  }

  getCurrentQuestion() {
    return this.questions[this.state.index];
  }

  updateStats() {
    const correct = this.state.score;
    const partial = this.state.partialCount;
    const wrong = this.state.index - correct - partial;
    const pending = this.state.total - this.state.index;

    this.state.stats = { correct, wrong, partial, pending };
  }

  answerSingle(selectedIndex) {
    const question = this.getCurrentQuestion();
    if (selectedIndex === question.answer) this.state.score++;
  }

  answerMultiple(selected, correct) {
    const hasWrong = selected.some(i => !correct.includes(i));
    const hasAllCorrect = correct.every(i => selected.includes(i));
    const isPartial = !hasWrong && !hasAllCorrect && selected.length > 0;

    if (selected.length === correct.length && !hasWrong) {
      this.state.score++;
    } else if (isPartial) {
      this.state.partialCount++;
    }
  }

  next() {
    this.state.index++;
    this.updateStats();
  }

  isFinished() {
    return this.state.index >= this.state.total;
  }

  reset() {
    this.questions = this.questions
      .map(q => this.shuffleOptions(q))
      .sort(() => Math.random() - 0.5);

    this.state.index = 0;
    this.state.score = 0;
    this.state.partialCount = 0;
    this.selectedMultiple.clear();
    this.updateStats();
  }
}
