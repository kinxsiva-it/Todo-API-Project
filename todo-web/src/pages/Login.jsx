import { useEffect, useRef, useState } from 'react';
import { requestNotificationPermission } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

const styles = {
  page: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#f4f7fb',
    color: '#172033',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    padding: '24px',
  },
  shell: {
    width: '100%',
    maxWidth: '420px',
  },
  panel: {
    background: '#ffffff',
    border: '1px solid #d9e1ee',
    borderRadius: '8px',
    boxShadow: '0 16px 45px rgba(31, 47, 70, 0.12)',
    padding: '24px',
  },
  header: {
    marginBottom: '22px',
  },
  eyebrow: {
    margin: '0 0 8px',
    color: '#4b647f',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    lineHeight: 1.15,
    letterSpacing: 0,
  },
  subtitle: {
    margin: '10px 0 0',
    color: '#52657a',
    fontSize: '14px',
    lineHeight: 1.5,
  },
  tabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
    padding: '4px',
    border: '1px solid #d9e1ee',
    borderRadius: '8px',
    background: '#f6f8fb',
    marginBottom: '18px',
  },
  tab: {
    minHeight: '38px',
    border: 0,
    borderRadius: '6px',
    background: 'transparent',
    color: '#4b647f',
    fontWeight: 700,
    cursor: 'pointer',
  },
  activeTab: {
    background: '#ffffff',
    color: '#172033',
    boxShadow: '0 1px 4px rgba(31, 47, 70, 0.12)',
  },
  form: {
    display: 'grid',
    gap: '14px',
  },
  field: {
    display: 'grid',
    gap: '7px',
  },
  label: {
    color: '#34475d',
    fontSize: '13px',
    fontWeight: 700,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    minHeight: '42px',
    border: '1px solid #c8d4e3',
    borderRadius: '6px',
    padding: '0 12px',
    color: '#172033',
    fontSize: '15px',
    outline: 'none',
    background: '#ffffff',
  },
  submit: {
    minHeight: '44px',
    border: 0,
    borderRadius: '6px',
    background: '#1f7a66',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 800,
    cursor: 'pointer',
    marginTop: '4px',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  error: {
    border: '1px solid #f1b8b8',
    background: '#fff2f2',
    color: '#9f2424',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '14px',
    marginBottom: '14px',
  },
  successPanel: {
    display: 'grid',
    gap: '14px',
  },
  userBox: {
    border: '1px solid #bee1d2',
    background: '#f2fbf7',
    borderRadius: '8px',
    padding: '14px',
  },
  userLabel: {
    margin: '0 0 4px',
    color: '#4b647f',
    fontSize: '12px',
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  userEmail: {
    margin: 0,
    color: '#12382f',
    fontWeight: 800,
    overflowWrap: 'anywhere',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  notifyButton: {
    minHeight: '42px',
    border: 0,
    borderRadius: '6px',
    background: '#2457a6',
    color: '#ffffff',
    fontWeight: 800,
    cursor: 'pointer',
  },
  secondaryButton: {
    minHeight: '42px',
    border: '1px solid #c8d4e3',
    borderRadius: '6px',
    background: '#ffffff',
    color: '#34475d',
    fontWeight: 800,
    cursor: 'pointer',
  },
};

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailInputRef = useRef(null);

  const clearError = useAuthStore((s) => s.clearError);
  const error = useAuthStore((s) => s.error);
  const fetchCsrf = useAuthStore((s) => s.fetchCsrf);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchCsrf();
  }, [fetchCsrf]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    clearError();
    setPassword('');
    emailInputRef.current?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const isSuccess =
      mode === 'login'
        ? await login(trimmedEmail, password)
        : await register(trimmedEmail, password);

    setPassword('');

    if (!isSuccess) {
      emailInputRef.current?.focus();
    }
  };

  const handleEnableNotification = async () => {
    const fcmToken = await requestNotificationPermission();

    if (fcmToken) {
      window.alert('Notifications are enabled for this browser.');
    }
  };

  const isRegister = mode === 'register';

  return (
    <main style={styles.page}>
      <section style={styles.shell}>
        <div style={styles.panel}>
          <header style={styles.header}>
            <p style={styles.eyebrow}>Todo Web</p>
            <h1 style={styles.title}>{user ? 'Welcome back' : 'Account access'}</h1>
          </header>

          {user ? (
            <div style={styles.successPanel}>
              <div style={styles.userBox}>
                <p style={styles.userLabel}>Signed in as</p>
                <p style={styles.userEmail}>{user.email}</p>
              </div>

              <div style={styles.actions}>
                <button type="button" style={styles.notifyButton} onClick={handleEnableNotification}>
                  Enable FCM
                </button>
                <button type="button" style={styles.secondaryButton} onClick={logout}>
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.tabs} role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isRegister}
                  style={{ ...styles.tab, ...(!isRegister ? styles.activeTab : null) }}
                  onClick={() => switchMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isRegister}
                  style={{ ...styles.tab, ...(isRegister ? styles.activeTab : null) }}
                  onClick={() => switchMode('register')}
                >
                  Register
                </button>
              </div>

              {error && <div style={styles.error}>{error}</div>}

              <form style={styles.form} onSubmit={handleSubmit}>
                <label style={styles.field}>
                  <span style={styles.label}>Email</span>
                  <input
                    ref={emailInputRef}
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    disabled={isLoading}
                    style={styles.input}
                  />
                </label>

                <label style={styles.field}>
                  <span style={styles.label}>Password</span>
                  <input
                    type="password"
                    name="password"
                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                    style={styles.input}
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  style={{ ...styles.submit, ...(isLoading ? styles.disabled : null) }}
                >
                  {isLoading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
