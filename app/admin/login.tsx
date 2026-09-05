'use client';

import { FormEvent, useEffect, useState } from 'react';

type Language = 'zh' | 'en';

const copy = {
  zh: {
    title: 'Kvisl 后台', password: '后台密码', signIn: '进入后台', failed: '密码不正确，请再试一次。', language: '语言'
  },
  en: {
    title: 'Kvisl Admin', password: 'Admin password', signIn: 'Sign in', failed: 'The password is incorrect. Please try again.', language: 'Language'
  }
} as const;

export function AdminLogin() {
  const [message, setMessage] = useState('');
  const [language, setLanguage] = useState<Language>('zh');
  const t = copy[language];

  useEffect(() => {
    const saved = window.localStorage.getItem('kvisl-admin-language');
    if (saved === 'zh' || saved === 'en') setLanguage(saved);
    else if (!navigator.language.toLowerCase().startsWith('zh')) setLanguage('en');
  }, []);

  function changeLanguage(next: Language) {
    setLanguage(next);
    setMessage('');
    window.localStorage.setItem('kvisl-admin-language', next);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch('/api/admin/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: form.get('password') })
    });
    if (response.ok) {
      window.location.reload();
      return;
    }
    setMessage(t.failed);
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginBottom: 18 }} aria-label={t.language}>
        <button type="button" aria-pressed={language === 'zh'} onClick={() => changeLanguage('zh')} style={{ marginTop: 0, background: language === 'zh' ? 'var(--text)' : 'transparent', color: language === 'zh' ? 'var(--bg)' : 'var(--text)' }}>中文</button>
        <button type="button" aria-pressed={language === 'en'} onClick={() => changeLanguage('en')} style={{ marginTop: 0, background: language === 'en' ? 'var(--text)' : 'transparent', color: language === 'en' ? 'var(--bg)' : 'var(--text)' }}>English</button>
      </div>
      <h1>{t.title}</h1>
      <label htmlFor="admin-password">{t.password}</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
      <button type="submit">{t.signIn}</button>
      <p role="status">{message}</p>
    </form>
  );
}
