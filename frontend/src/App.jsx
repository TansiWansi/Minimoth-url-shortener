import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LinksPage from './pages/LinksPage';

export default function App() {
  const [phone, setPhone] = useState(() => localStorage.getItem('phone') || '');
  const [token, setToken] = useState(() => localStorage.getItem('access_token') || '');
  const [page, setPage] = useState('home');

  const isLoggedIn = !!token;

  function handleLogin(userPhone) {
    setPhone(userPhone);
    setToken(localStorage.getItem('access_token'));
    setPage('home');
  }

  function handleLogout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('phone');
    setToken('');
    setPhone('');
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (page === 'links') {
    return <LinksPage onNavigate={setPage} onLogout={handleLogout} />;
  }

  return <HomePage phone={phone} onNavigate={setPage} onLogout={handleLogout} />;
}
