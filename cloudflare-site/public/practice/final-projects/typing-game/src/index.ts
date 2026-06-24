const words: string[] = [
  "apple", "banana", "orange", "grape", "melon",
  "cherry", "lemon", "peach", "strawberry", "kiwi",
  "mango", "pineapple", "watermelon", "blueberry", "raspberry",
  "javascript", "typescript", "python", "java", "ruby",
  "hello", "world", "computer", "keyboard", "mouse"
];

let currentWord: string = "";
let score: number = 0;
let timeLeft: number = 60;
let isPlaying: boolean = false;
let timerId: number | null = null;

const wordDisplay = document.getElementById("wordDisplay") as HTMLDivElement;
const inputField = document.getElementById("inputField") as HTMLInputElement;
const scoreDisplay = document.getElementById("scoreDisplay") as HTMLDivElement;
const timeDisplay = document.getElementById("timeDisplay") as HTMLDivElement;
const startButton = document.getElementById("startButton") as HTMLButtonElement;
const resultContainer = document.getElementById("result") as HTMLDivElement;
const finalScore = document.getElementById("finalScore") as HTMLParagraphElement;
const restartButton = document.getElementById("restartButton") as HTMLButtonElement;

function getRandomWord(): string {
  return words[Math.floor(Math.random() * words.length)];
}

function updateDisplay(): void {
  wordDisplay.textContent = currentWord;
  scoreDisplay.textContent = `スコア: ${score}`;
  timeDisplay.textContent = `残り時間: ${timeLeft}秒`;
}

function nextWord(): void {
  currentWord = getRandomWord();
  updateDisplay();
  inputField.value = "";
}

function checkInput(): void {
  if (inputField.value === currentWord) {
    score++;
    nextWord();
  }
}

function startGame(): void {
  isPlaying = true;
  score = 0;
  timeLeft = 60;

  startButton.disabled = true;
  inputField.disabled = false;
  inputField.focus();
  resultContainer.style.display = "none";

  nextWord();

  timerId = window.setInterval(() => {
    timeLeft--;
    updateDisplay();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame(): void {
  isPlaying = false;

  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  inputField.disabled = true;
  startButton.disabled = false;

  wordDisplay.textContent = "ゲーム終了！";
  finalScore.textContent = `あなたのスコア: ${score}語`;
  resultContainer.style.display = "block";
}

function restart(): void {
  resultContainer.style.display = "none";
  startGame();
}

inputField.addEventListener("input", checkInput);
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restart);

// 初期化
inputField.disabled = true;
updateDisplay();
