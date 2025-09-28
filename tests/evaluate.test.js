const quizService = require('../src/services/quizServices');
const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '..', '..', 'quizzes');

// helper to clean quizzes dir between tests
function cleanQuizzes() {
  if (!fs.existsSync(QUIZ_DIR)) return;
  for (const f of fs.readdirSync(QUIZ_DIR)) {
    fs.unlinkSync(path.join(QUIZ_DIR, f));
  }
}

beforeEach(() => {
  if (!fs.existsSync(QUIZ_DIR)) fs.mkdirSync(QUIZ_DIR);
  cleanQuizzes();
});
afterAll(() => cleanQuizzes());

test('single choice correct and incorrect scoring', () => {
  const quiz = quizService.createQuiz('Single Choice Test');
  // add single choice q
  const q = quizService.addQuestionToQuiz(quiz.id, {
    text: '2+2=?',
    type: 'single',
    options: [
      { text: '3', isCorrect: false },
      { text: '4', isCorrect: true },
      { text: '5', isCorrect: false }
    ]
  });

  // correct answer
  const res1 = quizService.evaluateAnswers(quizService.loadQuiz(quiz.id), [{
    questionId: q.id,
    selected: [q.options.find(o => o.isCorrect).id]
  }]);
  expect(res1.score).toBe(1);
  expect(res1.total).toBe(1);

  // incorrect
  const wrongId = q.options.find(o => !o.isCorrect).id;
  const res2 = quizService.evaluateAnswers(quizService.loadQuiz(quiz.id), [{
    questionId: q.id,
    selected: [wrongId]
  }]);
  expect(res2.score).toBe(0);
});

test('multiple choice exact match scoring', () => {
  const quiz = quizService.createQuiz('Multiple Choice Test');
  const q = quizService.addQuestionToQuiz(quiz.id, {
    text: 'Pick primes < 10',
    type: 'multiple',
    options: [
      { text: '2', isCorrect: true },
      { text: '3', isCorrect: true },
      { text: '4', isCorrect: false },
      { text: '5', isCorrect: true }
    ]
  });

  const correctIds = q.options.filter(o => o.isCorrect).map(o => o.id);
  // exact match => score 1
  const res1 = quizService.evaluateAnswers(quizService.loadQuiz(quiz.id), [{
    questionId: q.id,
    selected: correctIds
  }]);
  expect(res1.score).toBe(1);

  // partial match => score 0
  const partial = [correctIds[0]];
  const res2 = quizService.evaluateAnswers(quizService.loadQuiz(quiz.id), [{
    questionId: q.id,
    selected: partial
  }]);
  expect(res2.score).toBe(0);

  // extra wrong selection => score 0
  const extra = [...correctIds, q.options.find(o => !o.isCorrect).id];
  const res3 = quizService.evaluateAnswers(quizService.loadQuiz(quiz.id), [{
    questionId: q.id,
    selected: extra
  }]);
  expect(res3.score).toBe(0);
});

test('text question not auto scored and excluded from total', () => {
  const quiz = quizService.createQuiz('Text Test');
  const q1 = quizService.addQuestionToQuiz(quiz.id, {
    text: 'Explain Pythagoras',
    type: 'text'
  });
  const q2 = quizService.addQuestionToQuiz(quiz.id, {
    text: '2+2=?',
    type: 'single',
    options: [
      { text: '4', isCorrect: true },
      { text: '3', isCorrect: false }
    ]
  });

  const q2Correct = q2.options.find(o => o.isCorrect).id;

  const result = quizService.evaluateAnswers(quizService.loadQuiz(quiz.id), [
    { questionId: q1.id, selected: [] },
    { questionId: q2.id, selected: [q2Correct] }
  ]);

  expect(result.score).toBe(1);
  expect(result.total).toBe(1); // only the single choice counts toward total
});
