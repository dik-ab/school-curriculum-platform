let seconds = 0;
let intervalId: number | null = null;
let isRunning = false;

const timeDisplay = document.getElementById("timeDisplay") as HTMLDivElement;
const startButton = document.getElementById("startButton") as HTMLButtonElement;
const stopButton = document.getElementById("stopButton") as HTMLButtonElement;
const resetButton = document.getElementById("resetButton") as HTMLButtonElement;

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function updateDisplay(): void {
  timeDisplay.textContent = formatTime(seconds);
}

function start(): void {
  if (isRunning) return;

  isRunning = true;
  startButton.disabled = true;
  stopButton.disabled = false;

  intervalId = window.setInterval(() => {
    seconds++;
    updateDisplay();
  }, 1000);
}

function stop(): void {
  if (!isRunning) return;

  isRunning = false;
  startButton.disabled = false;
  stopButton.disabled = true;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function reset(): void {
  stop();
  seconds = 0;
  updateDisplay();
  startButton.disabled = false;
  stopButton.disabled = true;
}

startButton.addEventListener("click", start);
stopButton.addEventListener("click", stop);
resetButton.addEventListener("click", reset);

// 初期化
updateDisplay();
stopButton.disabled = true;
