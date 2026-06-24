import type { Todo } from '../types/todo';

const API_BASE_URL = 'http://localhost:3000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(`APIエラー: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTodos(): Promise<Todo[]> {
  const res = await fetch(`${API_BASE_URL}/todos`);
  return handleResponse<Todo[]>(res);
}

export async function createTodo(title: string): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return handleResponse<Todo>(res);
}

export async function updateTodo(
  id: number,
  data: { title?: string; completed?: boolean },
): Promise<Todo> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Todo>(res);
}

export async function deleteTodo(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`APIエラー: ${res.status} ${res.statusText}`);
  }
}
