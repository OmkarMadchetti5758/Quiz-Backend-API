const express = require("express");
const router = express.Router();
const quizController = require("../controller/quiz.controller");

router.post("/create-quiz", quizController.createQuiz);
router.post("/:quizId/add-question", quizController.addQuestion);
router.post("/:quizId/submit-answer", quizController.submitAnswers);

router.get("/quizzes", quizController.getQuizzes);
router.get("/:quizId/questions", quizController.getQuestions);

module.exports = router;
