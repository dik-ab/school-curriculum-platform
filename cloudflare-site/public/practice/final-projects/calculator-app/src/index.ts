let currentValue: string = "0";
let previousValue: string = "";
let operator: string | null = null;
let shouldResetDisplay: boolean = false;

const display = document.getElementById("display") as HTMLDivElement;

function updateDisplay(): void {
  display.textContent = currentValue;
}

function appendNumber(num: string): void {
  if (shouldResetDisplay) {
    currentValue = num;
    shouldResetDisplay = false;
  } else {
    currentValue = currentValue === "0" ? num : currentValue + num;
  }
  updateDisplay();
}

function appendDecimal(): void {
  if (shouldResetDisplay) {
    currentValue = "0.";
    shouldResetDisplay = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  updateDisplay();
}

function setOperator(op: string): void {
  if (operator !== null && !shouldResetDisplay) {
    calculate();
  }

  previousValue = currentValue;
  operator = op;
  shouldResetDisplay = true;
}

function calculate(): void {
  if (operator === null || previousValue === "") return;

  const prev = parseFloat(previousValue);
  const current = parseFloat(currentValue);
  let result: number;

  switch (operator) {
    case "+":
      result = prev + current;
      break;
    case "-":
      result = prev - current;
      break;
    case "×":
      result = prev * current;
      break;
    case "÷":
      if (current === 0) {
        alert("0で割ることはできません");
        clear();
        return;
      }
      result = prev / current;
      break;
    default:
      return;
  }

  currentValue = result.toString();
  operator = null;
  previousValue = "";
  shouldResetDisplay = true;
  updateDisplay();
}

function clear(): void {
  currentValue = "0";
  previousValue = "";
  operator = null;
  shouldResetDisplay = false;
  updateDisplay();
}

// イベントリスナーの設定
document.querySelectorAll(".number").forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.target as HTMLButtonElement;
    appendNumber(target.textContent!);
  });
});

document.querySelectorAll(".operator").forEach((button) => {
  button.addEventListener("click", (e) => {
    const target = e.target as HTMLButtonElement;
    setOperator(target.textContent!);
  });
});

document.getElementById("equals")?.addEventListener("click", calculate);
document.getElementById("decimal")?.addEventListener("click", appendDecimal);
document.getElementById("clear")?.addEventListener("click", clear);

// 初期化
updateDisplay();
