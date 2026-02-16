export async function loadQuestions(category) {
  const response = await fetch(`${import.meta.env.BASE_URL}categories/${category}.json`);
  if (!response.ok) throw new Error('Category not found');

  const questions = await response.json();
  if (!questions || !questions.length) {
    throw new Error('No questions found');
  }

  return questions;
}