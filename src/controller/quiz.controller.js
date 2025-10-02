const quizService = require("../services/quizServices");
const ApiError = require("../utils/ApiError");
const { response } = require("../utils/ApiResponse");
const validateQuestion = require("../validator/validateQuestion");

const createQuiz = (req, res) => {
  try {
    const title = req.body.title;
    if (!title || typeof title !== "string") {
      throw new ApiError(400, "Title is required");
    }
    const quiz = quizService.createQuiz(title);
    return response(res, 201, "Quiz created quccessfully", quiz.id);
  } catch (error) {
    console.error("Server error", error);
    return response(res, 500, "Server error");
  } 
};

const addQuestion = (req, res) => {
  try {
    const quizId = req.params.quizId;
    const payload = req.body;

    const quiz = quizService.loadQuiz(quizId);
    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    const validation = validateQuestion(payload);
    if (validation instanceof Error) {
      throw validation;
    }

    const question = quizService.addQuestionToQuiz(quizId, payload);
    return response(res, 201, "Question added", question);
  } catch (error) {
    console.error("Server error", error);
    return response(res, 500, "Server error");
  }
};

const getQuestions = (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = quizService.loadQuiz(quizId);
    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    const questions = quiz.questions.map((q) => {
      const out = { id: q.id, text: q.text, type: q.type };
      if (q.type !== "text") {
        out.options = q.options.map((o) => ({ id: o.id, text: o.text }));
      }

      return out;
    });

    return response(res, 200, "Question fetched successfully", questions);
  } catch (error) {
    console.error("Server error", error);
    return response(res, 500, "Server error");
  }
};

const getQuizzes = (req, res) => {
  try {
    const list = quizService.listQuizzesMetadata();
    return response(res, 200, "Quiz Fetched successfully", list);
  } catch (error) {
    console.error("Server error", error);
    return response(res, 500, "Server error");
  }
};

const submitAnswers = (req, res) => {
  try {
    const quizId = req.params.quizId;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      throw new ApiError(400, "Answers array required");
    }

    const quiz = quizService.loadQuiz(quizId);
    if (!quiz) {
      throw new ApiError(404, "Quiz not found");
    }

    const result = quizService.evaluateAnswers(quiz, answers);
    return response(res, 200, "Answer submitted successfully", {
      score: result.score,
      total: result.total,
    });
  } catch (error) {
    console.error("Server error", error);
    return response(res, 500, "Server error");
  }
};

module.exports = {
  createQuiz,
  addQuestion,
  getQuestions,
  submitAnswers,
  getQuizzes,
};
