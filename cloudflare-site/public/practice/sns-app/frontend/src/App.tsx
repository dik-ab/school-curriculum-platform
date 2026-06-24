import { useHashRoute } from './hooks/useHashRoute';
import { isLoggedIn } from './lib/apiClient';
import { Layout } from './components/Layout';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import TimelinePage from './pages/TimelinePage';
import UserPage from './pages/UserPage';
import ChatPage from './pages/ChatPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const { path, navigate } = useHashRoute();

  // 未ログインでもアクセスできるページ
  if (path === '/register') return <RegisterPage navigate={navigate} />;
  if (path === '/login') return <LoginPage navigate={navigate} />;
  if (path.startsWith('/verify-email')) return <VerifyEmailPage path={path} />;

  // ここから下はログイン必須
  if (!isLoggedIn()) {
    location.hash = '#/login';
    return null;
  }

  if (path === '/') {
    return (
      <Layout>
        <TimelinePage />
      </Layout>
    );
  }

  if (path.startsWith('/users/')) {
    return (
      <Layout>
        <UserPage />
      </Layout>
    );
  }

  if (path === '/chat') {
    return (
      <Layout>
        <ChatPage />
      </Layout>
    );
  }

  if (path === '/settings') {
    return (
      <Layout>
        <SettingsPage />
      </Layout>
    );
  }

  return (
    <Layout>
      <p>ページが見つかりません</p>
    </Layout>
  );
}
