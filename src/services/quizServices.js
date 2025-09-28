const fs = require("fs");
const path = require("path");
const { generateRandomId } = require("../utils/generateId");

const QUIZ_DIR = path.join(__dirname, "../quizzes");

if (!fs.existsSync(QUIZ_DIR)) {
  //creating directory if not exists
  fs.mkdirSync(QUIZ_DIR);
}

function quizFilePath(quizId) {
  //extracting file path for quiz
  return path.join(QUIZ_DIR, `${quizId}.json`);
}

function createQuiz(title) {
  //creating random ID for quiz eg.(quiz-123456)
  const id = `quiz-${generateRandomId()}`;
  const quiz = { id, title, questions: [] };

  //saving quiz as JSON file
  fs.writeFileSync(quizFilePath(id), JSON.stringify(quiz, null, 2));
  return quiz;
}

function loadQuiz(quizId) {
  //extarct file path for quiz
  const fp = quizFilePath(quizId);

  //checking file exists or not
  if (!fs.existsSync(fp)) return null;

  //reading file and parsing it
  const raw = fs.readFileSync(fp, "utf-8");
  return JSON.parse(raw); //
}

function saveQuiz(quiz) {
  //saving quiz into the file
  fs.writeFileSync(quizFilePath(quiz.id), JSON.stringify(quiz, null, 2));
}

function listQuizzesMetadata() {
  const files = fs.readdirSync(QUIZ_DIR).filter((f) => f.endsWith(".json"));
  const list = files.map((file) => {
    const data = JSON.parse(
      fs.readFileSync(path.join(QUIZ_DIR, file), "utf-8")
    );
    return { id: data.id, title: data.title };
  });

  return list;
}

function addQuestionToQuiz(quizId, questionPayload) {
  const quiz = loadQuiz(quizId);
  if (!quiz) return null;

  const questionId = generateRandomId();
  const question = {
    id: questionId,
    text: questionPayload.text,
    type: questionPayload.type,
  };

  if (questionPayload.type !== "text") {
    question.options = questionPayload.options.map((opt) => {
      return {
        id: `opt-${generateRandomId()}`,
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect),
      };
    });
  }

  quiz.questions.push(question);
  saveQuiz(quiz);
  return question;
}

function evaluateAnswers(quiz, answers) {
  let score = 0;
  const questionMap = new Map(quiz.questions.map((q) => [String(q.id), q]));

  for (const ans of answers) {
    const qid = String(ans.questionId);
    const q = questionMap.get(qid);
    if (!q) {
      continue;
    }

    if (q.type === "text") {
      continue;
    }

    const selected = Array.isArray(ans.selected) ? ans.selected : [];

    if (q.type === "single") {
      const correct = q.options.find((o) => o.isCorrect === true);
      if (!correct) {
        continue;
      }

      if (selected.length === 1 && String(selected[0]) === String(correct.id)) {
        score += 1;
      }
    } else if (q.type === "multiple") {
      const correctIds = q.options
        .filter((o) => o.isCorrect)
        .map((o) => String(o.id))
        .sort();

      const selectedIds = selected.map((s) => String(s)).sort();

      const match =
        correctIds.length === selectedIds.length &&
        correctIds.every((v, i) => v === selectedIds[i]);

      if (match) {
        score += 1;
      }
    }
  }

  const total = quiz.questions.filter((q) => q.type !== "text").length;
  return { score, total };
}

module.exports = {
  createQuiz,
  loadQuiz,
  saveQuiz,
  listQuizzesMetadata,
  addQuestionToQuiz,
  evaluateAnswers,
};
