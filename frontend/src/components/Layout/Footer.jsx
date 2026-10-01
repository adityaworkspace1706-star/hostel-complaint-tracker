import { Link } from 'react-router-dom';
import { Building2, Heart } from 'lucide-react';
import { CATEGORY_NAMES } from '../../utils/constants.js';

export const Footer = () => (
  <footer className="bg-slate-900 text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold text-white">
              Hostel<span className="text-indigo-400">Care</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            A modern complaint tracking platform for hostels. Students report issues in
            seconds and managers resolve them faster — with full visibility at every step.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Platform</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/#about" className="text-slate-400 transition hover:text-white">About</Link>
            </li>
            <li>
              <Link to="/#features" className="text-slate-400 transition hover:text-white">Features</Link>
            </li>
            <li>
              <Link to="/login" className="text-slate-400 transition hover:text-white">Student login</Link>
            </li>
            <li>
              <Link to="/login" className="text-slate-400 transition hover:text-white">Manager login</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white">Complaint categories</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CATEGORY_NAMES.slice(0, 5).map((category) => (
              <li key={category} className="text-slate-400">
                {category}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 sm:flex-row">
        <p className="text-xs text-slate-500">
          © {new Date().getFullYear()} HostelCare. Built as a college &amp; portfolio project.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          Made with <Heart className="h-3.5 w-3.5 text-red-400" /> for hostel life
        </p>
      </div>
    </div>
  </footer>
);
