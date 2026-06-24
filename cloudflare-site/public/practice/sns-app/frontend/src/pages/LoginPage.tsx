import { useState } from "react";
import { apiFetch, saveToken } from "../lib/apiClient";

type Props = {
  navigate: (to: string) => void;
};

export default function LoginPage({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveToken(res.accessToken);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <h1>ログイン</h1>
      <form onSubmit={handleSubmit}>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          パスワード
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "ログイン中..." : "ログイン"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        アカウントがない場合は <a href="#/register">ユーザー登録</a>
      </p>
    </main>
  );
}
