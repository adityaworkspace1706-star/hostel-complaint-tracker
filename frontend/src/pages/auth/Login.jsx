import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, UserPlus } from 'lucide-react';
import { Input } from '../../components/ui/Input.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { validateLogin } from '../../utils/validators.js';
import { ROLES } from '../../utils/constants.js';

const DEMO_ACCOUNTS = [
  { label: 'Student demo', email: 'student@hostel.com', password: 'password123' },
  { label: 'Manager demo', email: 'manager@hostel.com', password: 'ChangeThisPassword123!' },
];

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateLogin(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const user = await login(form);
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from;
      if (from && !from.startsWith('/login')) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === ROLES.MANAGER ? '/manager' : '/student', { replace: true });
      }
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-500">Log in to track your complaints.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          autoComplete="email"
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={form.password}
          onChange={(e) => setField('password', e.target.value)}
          autoComplete="current-password"
        />

        {error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} icon={LogIn} className="w-full" size="lg">
          Log in
        </Button>
      </form>

      {/* Demo accounts */}
      <div className="mt-6 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
        <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
          Try a demo account
        </p>
        <div className="mt-2.5 flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((demo) => (
            <button
              key={demo.label}
              type="button"
              onClick={() => setForm({ email: demo.email, password: demo.password })}
              className="flex items-center justify-between rounded-lg bg-white px-3.5 py-2.5 text-left text-sm ring-1 ring-slate-200 transition hover:ring-indigo-300"
            >
              <span className="font-semibold text-slate-700">{demo.label}</span>
              <span className="text-xs text-slate-400">{demo.email}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link to="/register" className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-500">
          <UserPlus className="h-3.5 w-3.5" /> Create an account
        </Link>
      </p>
    </div>
  );
}
