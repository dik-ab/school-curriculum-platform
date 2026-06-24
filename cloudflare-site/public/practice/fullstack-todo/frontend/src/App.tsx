import { useEffect, useState } from 'react';
import type { Todo } from './types/todo';
import { createTodo, deleteTodo, fetchTodos, updateTodo } from './api/todos';
import './App.css';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTodos()
      .then((data) => setTodos(data))
      .catch((error: Error) => setErrorMessage(error.message))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const title = newTitle.trim();
    if (title === '') return;
    try {
      const created = await createTodo(title);
      setTodos([created, ...todos]);
      setNewTitle('');
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleToggle = async (todo: Todo) => {
    try {
      const updated = await updateTodo(todo.id, {
        completed: !todo.completed,
      });
      setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter((t) => t.id !== id));
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  if (isLoading) {
    return <p className="status">読み込み中...</p>;
  }

  return (
    <main className="container">
      <h1>Todoアプリ</h1>

      {errorMessage !== null && <p className="error">{errorMessage}</p>}

      <form onSubmit={handleSubmit} className="todo-form">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="やることを入力..."
          maxLength={100}
        />
        <button type="submit">追加</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <label>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
              />
              <span className={todo.completed ? 'done' : ''}>
                {todo.title}
              </span>
            </label>
            <button type="button" onClick={() => handleDelete(todo.id)}>
              削除
            </button>
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p className="status">Todoはありません</p>}
    </main>
  );
}

export default App;
