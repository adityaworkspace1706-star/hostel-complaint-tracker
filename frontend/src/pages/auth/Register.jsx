import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, MapPin, ShieldCheck, User, UserPlus } from 'lucide-react';
import { Input } from '../../components/ui/Input.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { validateRegister } from '../../utils/validators.js';
import { HOSTELS } from '../../utils/constants.js';

export default function Register() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hostel: '',
    room: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateRegister(form);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const user = await register({
        name: form.name,
        email: form.email,
        password: form.password,
        hostel: form.hostel,
        room: form.room,
      });
      showToast(`Account created — welcome, ${user.name.split(' ')[0]}!`);
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
      <p className="mt-1 text-sm text-slate-500">
        Register as a student to start reporting complaints.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <Input
          label="Full name"
          placeholder="e.g. Aarav Sharma"
          icon={User}
          value={form.name}
          onChange={(e) => setField('name', e.target.value)}
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={form.email}
          onChange={(e) => setField('email', e.target.value)}
          autoComplete="email"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            icon={Lock}
            value={form.password}
            onChange={(e) => setField('password', e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat password"
            icon={Lock}
            value={form.confirmPassword}
            onChange={(e) => setField('confirmPassword', e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Hostel"
            value={form.hostel}
            onChange={(e) => setField('hostel', e.target.value)}
            placeholder="Select hostel"
            icon={Building2}
          >
            {HOSTELS.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </Select>
          <Input
            label="Room number"
            placeholder="e.g. 201"
            icon={MapPin}
            value={form.room}
            onChange={(e) => setField('room', e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" loading={submitting} icon={UserPlus} className="w-full" size="lg">
          Create account
        </Button>
      </form>

      <p className="mt-5 flex items-start gap-2 rounded-xl bg-indigo-50/70 px-3.5 py-3 text-xs leading-relaxed text-indigo-800 ring-1 ring-indigo-600/10">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Accounts are created as students. Manager accounts are provisioned separately by the
        hostel administration — you cannot self-register as a manager.
      </p>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
