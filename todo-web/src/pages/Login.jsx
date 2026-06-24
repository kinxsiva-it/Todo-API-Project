import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({ email, password });
  };

  return (
    <>
      <style>
        {`
          body {
            background: linear-gradient(135deg, #f8f9ff 0%, #e9ddff 100%);
            min-height: 100vh;
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0px 4px 20px rgba(0,0,0,0.04);
            border: 1px solid rgba(255, 255, 255, 0.5);
          }
        `}
      </style>

      <main className="w-full max-w-md">
        <div className="glass-card rounded-xl p-container-padding flex flex-col gap-gutter">
          <header className="text-center space-y-base mb-2">
            <div className="flex justify-center mb-card-gap">
              <div className="w-12 h-12 rounded-lg bg-primary-container flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-on-primary-container text-[28px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  task_alt
                </span>
              </div>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Welcome Back</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Log in to continue your serene workflow.
            </p>
          </header>

          <form className="flex flex-col gap-card-gap" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-base">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                Email
              </label>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </div>

            <div className="flex flex-col gap-base">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                  Password
                </label>
                <a
                  className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
                  href="#"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                />
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">visibility_off</span>
                </button>
              </div>
            </div>

            <button
              className="w-full bg-linear-to-r from-primary to-surface-tint hover:from-surface-tint hover:to-primary text-on-primary rounded-lg py-3 mt-2 font-headline-sm text-headline-sm transition-all active:scale-[0.98] shadow-md"
              type="submit"
            >
              Sign In
            </button>
          </form>

          <div className="flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-outline-variant"></div>
            <span className="font-label-sm text-label-sm text-outline">OR</span>
            <div className="flex-1 h-px bg-outline-variant"></div>
          </div>

          <button
            className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-low text-on-surface rounded-lg py-3 font-headline-sm text-headline-sm transition-colors"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              ></path>
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              ></path>
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              ></path>
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              ></path>
            </svg>
            Continue with Google
          </button>

          <div className="text-center mt-2">
            <span className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
            </span>
            <a
              className="font-headline-sm text-headline-sm text-primary hover:text-primary-container transition-colors"
              href="#"
            >
              Sign up
            </a>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 w-full flex justify-center items-center gap-card-gap py-section-margin bg-transparent flat no shadows opacity-80 hover:opacity-100">
        <div className="font-label-md text-label-md text-on-surface-variant dark:text-outline-variant flex gap-card-gap items-center">
          <span className="font-headline-sm text-headline-sm text-primary">TaskFlow</span>
          <span>© 2024 TaskFlow Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a
              className="text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-on-surface-variant dark:text-outline-variant hover:text-primary transition-colors"
              href="#"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
