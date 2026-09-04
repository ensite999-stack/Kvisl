'use client';

import { FormEvent, useState } from 'react';

export function AdminLogin() {
  const [message, setMessage] = useState('');

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
    const data = await response.json().catch(() => ({}));
    setMessage(data.message || 'Unable to sign in.');
  }

  return (
    <form className="admin-login" onSubmit={submit}>
      <h1>Kvisl editorial</h1>
      <label htmlFor="admin-password">Password</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required />
      <button type="submit">Sign in</button>
      <p role="status">{message}</p>
    </form>
  );
}
