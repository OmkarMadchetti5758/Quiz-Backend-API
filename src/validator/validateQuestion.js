const ApiError = require("../utils/ApiError");

function validateQuestion(payload) {
  const { text, type, options } = payload;
  if (!text || typeof text !== "string" || text.length > 300) {
    return new ApiError(400, "Question lenght must string of length 300");
  }

  if (!["single", "multiple", "text"].includes(type)) {
    return new ApiError(
      400,
      "Question type must be one of 'single', 'multiple', 'text'"
    );
  }

  if (type === "text") {
    if (options !== undefined && options.length > 0) {
      return new ApiError(400, "Text questions should not include options");
    }
    return true;
  }

  if (!Array.isArray(options) || options.length < 1) {
    return new ApiError(400, "Options must be an array with minimum length 1");
  }

  for (const opt of options) {
    if (!opt.text || typeof opt.text !== "string") {
      return new ApiError(400, "Every option must include a text string");
    }
  }

  const correctCount = options.filter((opt) => opt.isCorrect === true).length;
  if (type === "single" && correctCount !== 1) {
    return new ApiError(
      400,
      "Single choice questions must have exactly 1 option where isCorrect=true"
    );
  }
  if (type === "multiple" && correctCount < 1) {
    return new ApiError(
      400,
      "Multiple choice questions must have at least 1 correct option"
    );
  }

  return true;
}

module.exports = validateQuestion;
