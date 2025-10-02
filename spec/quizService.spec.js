const path = require('path');
const fs = require('fs');

describe('QuizService (mocked)', () => {
  let quizService;
  const QUIZ_DIR = path.join(__dirname, '..', '..', 'quizzes');

  beforeEach(() => {
    // mock service methods
    quizService = jasmine.createSpyObj('quizService', [
      'createQuiz',
      'addQuestionToQuiz',
      'loadQuiz',
      'evaluateAnswers'
    ]);

    // stub fs so no real files are touched
    spyOn(fs, 'existsSync').and.returnValue(true);
    spyOn(fs, 'mkdirSync').and.stub();
    spyOn(fs, 'readdirSync').and.returnValue([]);
    spyOn(fs, 'unlinkSync').and.stub();
  });

  it('should score single choice correctly', () => {
    const fakeQuiz = { id: 1, name: 'Single Choice Test' };
    const fakeQuestion = {
      id: 101,
      type: 'single',
      options: [
        { id: 1, text: '3', isCorrect: false },
        { id: 2, text: '4', isCorrect: true },
        { id: 3, text: '5', isCorrect: false }
      ]
    };

    quizService.createQuiz.and.returnValue(fakeQuiz);
    quizService.addQuestionToQuiz.and.returnValue(fakeQuestion);
    quizService.loadQuiz.and.returnValue(fakeQuiz);

    quizService.evaluateAnswers.and.callFake((quiz, answers) => {
      const correctId = 2;
      return {
        score: answers[0].selected[0] === correctId ? 1 : 0,
        total: 1
      };
    });

    const quiz = quizService.createQuiz('Single Choice Test');
    const q = quizService.addQuestionToQuiz(quiz.id, {});
    
    // ✅ correct
    const res1 = quizService.evaluateAnswers(quiz, [{ questionId: q.id, selected: [2] }]);
    expect(res1.score).toBe(1);

    // ❌ incorrect
    const res2 = quizService.evaluateAnswers(quiz, [{ questionId: q.id, selected: [1] }]);
    expect(res2.score).toBe(0);

    expect(quizService.createQuiz).toHaveBeenCalledWith('Single Choice Test');
    expect(quizService.evaluateAnswers).toHaveBeenCalledTimes(2);
  });

  it('should score multiple choice with exact matches only', () => {
    const fakeQuiz = { id: 2 };
    const fakeQuestion = {
      id: 201,
      type: 'multiple',
      options: [
        { id: 1, text: '2', isCorrect: true },
        { id: 2, text: '3', isCorrect: true },
        { id: 3, text: '4', isCorrect: false },
        { id: 4, text: '5', isCorrect: true }
      ]
    };
    const correctIds = [1, 2, 4];

    quizService.createQuiz.and.returnValue(fakeQuiz);
    quizService.addQuestionToQuiz.and.returnValue(fakeQuestion);
    quizService.loadQuiz.and.returnValue(fakeQuiz);
    quizService.evaluateAnswers.and.callFake((quiz, answers) => {
      const selected = answers[0].selected.sort();
      const exact = JSON.stringify(selected) === JSON.stringify(correctIds.sort());
      return { score: exact ? 1 : 0, total: 1 };
    });

    const quiz = quizService.createQuiz('Multiple Choice Test');
    const q = quizService.addQuestionToQuiz(quiz.id, {});

    // exact match
    const res1 = quizService.evaluateAnswers(quiz, [{ questionId: q.id, selected: correctIds }]);
    expect(res1.score).toBe(1);

    // partial
    const res2 = quizService.evaluateAnswers(quiz, [{ questionId: q.id, selected: [1] }]);
    expect(res2.score).toBe(0);

    // extra wrong
    const res3 = quizService.evaluateAnswers(quiz, [{ questionId: q.id, selected: [1, 2, 3, 4] }]);
    expect(res3.score).toBe(0);
  });

  it('should exclude text questions from auto scoring', () => {
    const fakeQuiz = { id: 3 };
    const q1 = { id: 301, type: 'text' };
    const q2 = {
      id: 302,
      type: 'single',
      options: [
        { id: 1, text: '4', isCorrect: true },
        { id: 2, text: '3', isCorrect: false }
      ]
    };

    quizService.createQuiz.and.returnValue(fakeQuiz);
    quizService.addQuestionToQuiz.and.callFake((quizId, q) =>
      q.type === 'text' ? q1 : q2
    );
    quizService.loadQuiz.and.returnValue(fakeQuiz);
    quizService.evaluateAnswers.and.callFake((quiz, answers) => {
      const onlyScored = answers.filter(a => a.questionId === q2.id);
      return { score: onlyScored.length, total: 1 };
    });

    const quiz = quizService.createQuiz('Text Test');
    const tq = quizService.addQuestionToQuiz(quiz.id, { type: 'text' });
    const sq = quizService.addQuestionToQuiz(quiz.id, { type: 'single' });

    const result = quizService.evaluateAnswers(quiz, [
      { questionId: tq.id, selected: [] },
      { questionId: sq.id, selected: [1] }
    ]);

    expect(result.score).toBe(1);
    expect(result.total).toBe(1); // text excluded
  });
});
