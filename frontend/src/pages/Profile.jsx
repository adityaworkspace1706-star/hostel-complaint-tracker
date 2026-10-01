import { useState } from 'react';
import { Building2, Mail, MapPin, Save, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { PageHeader } from '../components/ui/PageHeader.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Select } from '../components/ui/Select.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { HOSTELS, ROLES } from '../utils/constants.js';
import { formatDate } from '../utils/format.js';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const isStudent = user?.role === ROLES.STUDENT;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    hostel: user?.hostel || '',
    room: user?.room || '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || form.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile(form);
      showToast('Profile updated successfully');
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up">
      <PageHeader title="Profile" description="Manage your account information." />

      <Card className="p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <Avatar name={user?.name} size="lg" />
          <div>
            <p className="text-lg font-bold text-slate-900">{user?.name}</p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {isStudent ? 'Student' : 'Manager'}
            </span>
          </div>
          <p className="ml-auto text-xs text-slate-400">Member since {formatDate(user?.createdAt)}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <Input
            label="Full name"
            icon={User}
            value={form.name}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value }));
              setError('');
            }}
          />
          <Input
            label="Email"
            type="email"
            icon={Mail}
            value={form.email}
            onChange={(e) => {
              setForm((p) => ({ ...p, email: e.target.value }));
              setError('');
            }}
          />

          {isStudent && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                label="Hostel"
                icon={Building2}
                value={form.hostel}
                onChange={(e) => {
                  setForm((p) => ({ ...p, hostel: e.target.value }));
                  setError('');
                }}
              >
                {HOSTELS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </Select>
              <Input
                label="Room number"
                icon={MapPin}
                value={form.room}
                onChange={(e) => {
                  setForm((p) => ({ ...p, room: e.target.value }));
                  setError('');
                }}
              />
            </div>
          )}

          {error && (
            <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-600">{error}</p>
          )}

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <Button type="submit" loading={saving} icon={Save}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
