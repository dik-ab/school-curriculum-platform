import { useState } from "react";
import { apiFetch } from "../lib/apiClient";

type Props = {
  navigate: (to: string) => void;
};

// 登録成功後は画面遷移せず案内文を表示するため navigate は使わないが、
// 他のページとPropsの形を揃えて受け取っている
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function RegisterPage(_props: Props) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, username, displayName, password }),
      });
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  // 登録完了後の表示
  if (registered) {
    return (
      <main className="auth-page">
        <h1>確認メールを送りました</h1>
        <p>
          {email} 宛てに確認メールを送りました。メール内のURLを開いて、
          登録を完了してください。
        </p>
        <p>（開発中はメールは送られず、APIのログにURLが表示されます）</p>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <h1>ユーザー登録</h1>
      <form onSubmit={handleSubmit}>
        <label>
          メールアドレス
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          ユーザー名（英小文字・数字・_ で3〜20文字）
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          表示名
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>
        <label>
          パスワード（8文字以上）
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? "登録中..." : "登録する"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        アカウントを持っている場合は <a href="#/login">ログイン</a>
      </p>
    </main>
  );
}
