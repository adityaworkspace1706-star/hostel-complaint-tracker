import { useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  ImagePlus,
  MapPin,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Select } from '../ui/Select.jsx';
import { Textarea } from '../ui/Textarea.jsx';
import { PriorityBadge } from '../ui/PriorityBadge.jsx';
import {
  CATEGORY_NAMES,
  COMPLAINT_CATEGORIES,
  HOSTELS,
  getIssuesForCategory,
  getPriorityForIssue,
} from '../../utils/constants.js';
import { validateComplaint } from '../../utils/validators.js';

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5 MB

export const ComplaintForm = ({ onSubmit, submitting = false }) => {
  const [form, setForm] = useState({ category: '', issue: '', hostel: '', room: '', description: '' });
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState({});
  const fileRef = useRef(null);

  const issues = useMemo(() => getIssuesForCategory(form.category), [form.category]);
  const priority = useMemo(
    () => getPriorityForIssue(form.category, form.issue),
    [form.category, form.issue]
  );

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCategoryChange = (value) => {
    setForm((prev) => ({ ...prev, category: value, issue: '' }));
    setErrors((prev) => ({ ...prev, category: '', issue: '' }));
  };

  const handleImage = (file) => {
    setImageError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files are supported.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Image must be smaller than 1.5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const error = validateComplaint(form);
    if (error) {
      setErrors({ _form: error });
      return;
    }
    onSubmit({ ...form, images: image ? [image] : [] });
  };

  return (
    <Card className="p-6 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Category → Issue */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Category"
            value={form.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            placeholder="Select a category"
            error={errors.category}
          >
            {CATEGORY_NAMES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>

          <Select
            label="Specific issue"
            value={form.issue}
            onChange={(e) => setField('issue', e.target.value)}
            placeholder={form.category ? 'Select the specific issue' : 'Choose a category first'}
            disabled={!form.category}
            error={errors.issue}
          >
            {issues.map((issue) => (
              <option key={issue} value={issue}>
                {issue}
              </option>
            ))}
          </Select>
        </div>

        {/* Auto priority */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200/60">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Auto-assigned priority</p>
              <p className="text-xs text-slate-400">
                Priority is set automatically from the issue. Managers can override it later.
              </p>
            </div>
          </div>
          {priority ? (
            <PriorityBadge priority={priority} />
          ) : (
            <span className="rounded-full bg-slate-200/70 px-3 py-1 text-xs font-medium text-slate-500">
              Select an issue
            </span>
          )}
        </div>

        {/* Hostel + room */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Select
            label="Hostel"
            value={form.hostel}
            onChange={(e) => setField('hostel', e.target.value)}
            placeholder="Select your hostel"
            icon={Building2}
            error={errors.hostel}
          >
            {HOSTELS.map((hostel) => (
              <option key={hostel} value={hostel}>
                {hostel}
              </option>
            ))}
          </Select>
          <Input
            label="Room number"
            value={form.room}
            onChange={(e) => setField('room', e.target.value)}
            placeholder="e.g. 201"
            icon={MapPin}
            error={errors.room}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="Describe the problem in detail — when it started, what you see, anything the manager should know…"
          rows={4}
          error={errors.description}
          hint={`${form.description.length}/500 characters`}
          maxLength={500}
        />

        {/* Optional image */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-slate-700">Photo (optional)</p>
          {image ? (
            <div className="relative inline-block">
              <img
                src={image}
                alt="Attachment preview"
                className="h-36 w-48 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
              />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition hover:bg-slate-700"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleImage(e.dataTransfer.files?.[0]);
              }}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-4 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/40"
            >
              <ImagePlus className="h-7 w-7 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">
                Drag &amp; drop an image, or <span className="text-indigo-600">browse</span>
              </p>
              <p className="text-xs text-slate-400">PNG, JPG or WEBP · up to 1.5 MB</p>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImage(e.target.files?.[0])}
          />
          {imageError && <p className="mt-1.5 text-xs font-medium text-red-600">{imageError}</p>}
        </div>

        {/* Submit */}
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          {errors._form && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4" /> {errors._form}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="submit" loading={submitting} className="flex-1 sm:flex-none" icon={Send}>
              Submit Complaint
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};
