const express = require("express");
const bodyParser = require("body-parser");
const quizRoutes = require("./routes/quiz.route");

const app = express();
app.use(bodyParser.json());
const PORT = 3000;

app.use("/api", quizRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port : ${PORT}`);
});
