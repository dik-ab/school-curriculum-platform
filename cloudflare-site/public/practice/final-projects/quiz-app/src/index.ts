type Question = {
  question: string;
  choices: string[];
  correctIndex: number;
};

const questions: Question[] = [
  {
    question: "JavaScriptはどの種類の言語ですか？",
    choices: ["コンパイル言語", "インタプリタ言語", "マークアップ言語"],
    correctIndex: 1,
  },
  {
    question: "HTMLの正式名称は？",
    choices: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language"],
    correctIndex: 0,
  },
  {
    question: "CSSは何の略ですか？",
    choices: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System"],
    correctIndex: 1,
  },
  {
    question: "TypeScriptはどの言語のスーパーセットですか？",
    choices: ["Python", "Java", "JavaScript"],
    correctIndex: 2,
  },
  {
    question: "Webページの構造を定義するのは？",
    choices: ["HTML", "CSS", "JavaScript"],
    correctIndex: 0,
  },
];

let currentQuestionIndex = 0;
let score = 0;

const questionElement = document.getElementById("question") as HTMLParagraphElement;
const choicesContainer = document.getElementById("choices") as HTMLDivElement;
const resultContainer = document.getElementById("result") as HTMLDivElement;
const scoreElement = document.getElementById("score") as HTMLParagraphElement;
const restartButton = document.getElementById("restartButton") as HTMLButtonElement;

function showQuestion(): void {
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = `問題${currentQuestionIndex + 1}: ${currentQuestion.question}`;

  choicesContainer.innerHTML = "";

  currentQuestion.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.textContent = choice;
    button.className = "choice-btn";
    button.addEventListener("click", () => selectAnswer(index));
    choicesContainer.appendChild(button);
  });
}

function selectAnswer(selectedIndex: number): void {
  const currentQuestion = questions[currentQuestionIndex];

  if (selectedIndex === currentQuestion.correctIndex) {
    score++;
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult(): void {
  questionElement.style.display = "none";
  choicesContainer.style.display = "none";
  resultContainer.style.display = "block";

  const percentage = Math.round((score / questions.length) * 100);
  scoreElement.textContent = `${questions.length}問中${score}問正解！ (${percentage}%)`;
}

function restart(): void {
  currentQuestionIndex = 0;
  score = 0;

  questionElement.style.display = "block";
  choicesContainer.style.display = "block";
  resultContainer.style.display = "none";

  showQuestion();
}

restartButton.addEventListener("click", restart);

// 初期化
showQuestion();
