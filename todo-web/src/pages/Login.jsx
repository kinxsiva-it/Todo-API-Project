import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' },
  error: { color: 'red' },
  success: { color: 'green' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px' },
  button: { padding: '10px', cursor: 'pointer' },
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchCsrf = useAuthStore((s) => s.fetchCsrf);
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchCsrf();
  }, [fetchCsrf]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isSuccess = await login(email.trim(), password);
    setPassword('');
    if (!isSuccess) {
      // โฟกัสกลับไปที่ email ให้ผู้ใช้แก้ไขได้ทันทีถ้า login ไม่สำเร็จ
    }
  };

  return (
    <div style={styles.container}>
      <h2>เข้าสู่ระบบ (Todo App)</h2>

      {error && <p style={styles.error}>❌ {error}</p>}
      {user && <p style={styles.success}>{user.email}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          aria-label="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          style={styles.input}
        />
        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'กำลังโหลด...' : 'Login'}
        </button>
      </form>
    </div>
  );
}