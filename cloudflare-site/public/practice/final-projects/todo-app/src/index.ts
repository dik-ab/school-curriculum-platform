type Task = {
  id: number;
  text: string;
  completed: boolean;
};

let tasks: Task[] = [];
let nextId = 1;

const taskInput = document.getElementById("taskInput") as HTMLInputElement;
const addButton = document.getElementById("addButton") as HTMLButtonElement;
const taskList = document.getElementById("taskList") as HTMLUListElement;

function renderTasks(): void {
  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.completed ? "completed" : "";

    const span = document.createElement("span");
    span.textContent = task.text;
    span.addEventListener("click", () => toggleTask(task.id));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "削除";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
  });
}

function addTask(): void {
  const text = taskInput.value.trim();

  if (text === "") {
    alert("タスクを入力してください");
    return;
  }

  const newTask: Task = {
    id: nextId++,
    text: text,
    completed: false,
  };

  tasks.push(newTask);
  taskInput.value = "";
  renderTasks();
}

function deleteTask(id: number): void {
  tasks = tasks.filter((task) => task.id !== id);
  renderTasks();
}

function toggleTask(id: number): void {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    renderTasks();
  }
}

addButton.addEventListener("click", addTask);

taskInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTask();
  }
});
