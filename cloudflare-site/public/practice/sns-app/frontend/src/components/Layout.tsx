import { ReactNode } from 'react';
import { clearToken } from '../lib/apiClient';

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  const handleLogout = () => {
    clearToken();
    location.hash = '#/login';
  };

  return (
    <div className="layout">
      <header className="header">
        <a className="logo" href="#/">SNS</a>
        <nav className="nav">
          <a href="#/">タイムライン</a>
          <a href="#/chat">チャット</a>
          <a href="#/settings">設定</a>
          <button className="logout-button" onClick={handleLogout}>
            ログアウト
          </button>
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
