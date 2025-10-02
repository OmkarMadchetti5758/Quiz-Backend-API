# Quiz-Backend-API

A simple **QUIZ Backend API** for managing and taking quizzes, built with **Node.js** and **Express.js**
This project uses **file-based storage** (no database) for quick setup and testing

## Project Description

This project provides RESTful API endpoints for :

- Creating quiz
- Adding questions (single choice, multiple choice, text-based)
- Listing all available quizzes
- Fetching quiz questions (qithout exposing answers)
- Submitting answers and receiving score

It is designed without using database for its simplicity, clean separation of concerns (routes, controllers, services), and **file-based JSON storage** so no database setup is required

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or above recommended)
- npm (comes with Node.js)

### Steps

1. **Clone the repository**

```bash
    git clone https://github.com/OmkarMadchetti5758/Quiz-Backend-API.git
    cd Quiz-Backend-API
```

2. **Install dependencies**

```bash
    npm install
```

3. **Run the server**

```bash
    npm start
```

4. **The API will be available at** : http://localhost:3000/api

## Running Test case

```bash
    npm test
```

## Running Test case with coverage

```bash
   npm run test:coverage
```

### Test covers :

1. Creating quiz
2. Adding questions with validation
3. Submitting correct/incorrect answers
4. Ensuring score logic works(single/multiple choice)

## Assumptions & Design Choices

1. File based storage :
   a. Quizzes are stored as .json files inside src/quizzes
   b. Each quiz will have its own file with its metadata and questions
   c. This avoids needing a database setup for quick prototyping

2. ID Generation
   a. Each quiz will have its own ID with random 6 digit number
   b. Example : quiz-123456 (6-digit random number)

3. Answer submission
   a. Answers are submitted as an array of {questionId, selected: [optionsId]}
   b. Single choice having exactly 1 option ID
   c. Multiple choice having multiple option ID's
   d. Text questions are stored but not auto-scored

4. Validation
   a. Question text must be string <= 300
   b. Single choice question's will exactly have 1 correct option
   c. Multiple choice questions's must have atleast 1 correct option
   d. Opions must not be empty

5. Clean architecture
   a. Controller : Handling req/res
   b. Services : Contain's the main logic (quiz file handling, evaluation)
   c. Validators : Ensures questions are correctly validated
   d. Utils : Helper functions (RandomID generator, error/response handler)

## API Endpoints

1. Create a quiz - http://localhost:3000/api/create-quiz
2. Add question to a quiz - http://localhost:3000/api/<quizId>/add-question
3. List of quizzes - http://localhost:3000/api/quizzes
4. Get quiz questions without answers - http://localhost:3000/api/<quizId>/questions
5. Submit answer and get score - http://localhost:3000/api/<quizId>/submit-answer

```

```
