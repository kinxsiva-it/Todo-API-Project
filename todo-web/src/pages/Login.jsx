import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { requestNotificationPermission } from '../config/firebase';

const styles = {
  container: { maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif' },
  error: { color: 'red', marginBottom: '10px' },
  success: { color: 'green', marginBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px' },
  button: { padding: '10px', cursor: 'pointer' },
  notifyButton: { 
    padding: '10px', 
    cursor: 'pointer', 
    backgroundColor: '#ff4a4a', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px',
    marginTop: '10px',
    width: '100%'
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const emailInputRef = useRef(null); 

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
     
      emailInputRef.current?.focus();
    }
  };


  const handleEnableNotification = async () => {
    const token = await requestNotificationPermission();
    if (token) {
      alert('🔔 เปิดการแจ้งเตือนและส่ง Token ให้หลังบ้านสำเร็จแล้ว!');
    }
  };

  return (
    <div style={styles.container}>
      <h2>เข้าสู่ระบบ (Todo App)</h2>

      {error && <p style={styles.error}>❌ {error}</p>}
      

      {user && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #4CAF50', borderRadius: '5px' }}>
          <p style={styles.success}>✅ ยินดีต้อนรับคุณ: {user.email}</p>
          <button onClick={handleEnableNotification} style={styles.notifyButton}>
            เปิดรับการแจ้งเตือน (FCM) 🔔
          </button>
        </div>
      )}

      {!user && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            ref={emailInputRef} 
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
      )}
    </div>
  );
}