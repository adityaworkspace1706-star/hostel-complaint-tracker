// ---------------------------------------------------------------------------
// UI smoke run — drives the REAL stack (Vite dev server + Express + MongoDB,
// VITE_USE_MOCK=false) in headless Chrome over raw CDP. No npm dependencies.
//
//   1. Start backend (node server.js) and frontend (npm run dev)
//   2. Start Chrome: chrome --headless=new --remote-debugging-port=9223 ...
//   3. node scripts/ui-smoke.mjs
//
// ⚠️  The manager flow clicks the "Manager demo" quick-fill button on /login.
//     Do not remove that button without updating this script.
// Notes:
//  • body-text checks are CASE-INSENSITIVE because innerText reflects CSS
//    text-transform (section headers render UPPERCASE).
//  • mutations are confirmed via success toasts (survive in a recorder even
//    after the toast disappears) — not via always-visible UI text.
//  • every /api/ request is recorded with its HTTP status for diagnostics.
// ---------------------------------------------------------------------------
import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.UI_BASE_URL || 'http://localhost:5173';
const CDP = process.env.CDP_URL || 'http://127.0.0.1:9223';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const checks = [];
const check = (name, ok, detail = '') => {
  checks.push({ name, ok });
  console.log(`${ok ? '  PASS' : '  FAIL'} | ${name}${detail ? ' — ' + detail : ''}`);
  if (!ok) throw new Error(`CHECK FAILED: ${name} ${detail}`);
};

// ---------- CDP plumbing ----------------------------------------------------
const targets = await (await fetch(`${CDP}/json/list`)).json();
const page = targets.find((t) => t.type === 'page');
if (!page) throw new Error('No page target — is headless Chrome running on port 9223?');

const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error('Could not connect to Chrome CDP'));
});
let msgId = 0;
const pending = new Map();
const listeners = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    if (m.error) rej(new Error(m.error.message));
    else res(m.result);
  } else if (m.method) {
    listeners.forEach((fn) => fn(m));
  }
};
const send = (method, params = {}) =>
  new Promise((res, rej) => {
    const id = ++msgId;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });

await send('Page.enable');
await send('Runtime.enable');
await send('Network.enable');

// Record every API call + status (preflights are OPTIONS — keep them labelled)
const apiLog = [];
const reqMethod = new Map();
listeners.push((m) => {
  if (m.method === 'Network.requestWillBeSent') {
    reqMethod.set(m.params.requestId, m.params.request.method);
  }
  if (m.method === 'Network.responseReceived') {
    const { url } = m.params.response;
    if (url.includes('/api/')) {
      const method = reqMethod.get(m.params.requestId) || '?';
      apiLog.push(`${method} ${url.replace(BASE, '')} → ${m.params.response.status}`);
    }
  }
  if (m.method === 'Network.loadingFailed' && m.params.errorText !== 'net::ERR_ABORTED') {
    apiLog.push(`FAILED ${m.params.errorText}`);
  }
});
const apiSummary = () => apiLog.join('\n  ') || '(no API calls)';

const evaljs = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) {
    throw new Error(
      'page JS error: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text)
    );
  }
  return r.result.value;
};
const bodyText = () => evaljs('document.body.innerText');
const bodyHas = async (needle) => {
  const text = (await bodyText()) || '';
  return text.toLowerCase().includes(String(needle).toLowerCase());
};
const currentPath = () => evaljs('location.pathname');

const waitFor = async (expr, label, timeout = 25000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    try {
      if (await evaljs(`Boolean(${expr})`)) return;
    } catch {
      /* page may be mid-navigation */
    }
    await sleep(250);
  }
  let text = '';
  try {
    text = (await bodyText()).slice(0, 900);
  } catch {
    /* ignore */
  }
  throw new Error(`Timeout (${timeout}ms) waiting for ${label}\n--- page text ---\n${text}`);
};

/** Install a toast recorder — needed after every full page load. */
const installToastRecorder = () =>
  evaljs(`(() => {
    if (window.__toastRecorderInstalled) return true;
    window.__toasts = [];
    const record = () => {
      document.querySelectorAll('[role="status"] p').forEach((p) => {
        const t = p.textContent;
        if (t && !window.__toasts.some((x) => x.msg === t)) window.__toasts.push({ msg: t });
      });
    };
    new MutationObserver(record).observe(document.body, { subtree: true, childList: true, characterData: true });
    record();
    window.__toastRecorderInstalled = true;
    return true;
  })()`);

const getToasts = async () => (await evaljs('JSON.stringify((window.__toasts||[]).map(t=>t.msg))')) || '[]';

const waitForToast = async (needle, timeout = 10000) => {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const toasts = JSON.parse(await getToasts());
    const hit = toasts.find((t) => t.toLowerCase().includes(String(needle).toLowerCase()));
    if (hit) return hit;
    await sleep(250);
  }
  const toasts = JSON.parse(await getToasts());
  throw new Error(
    `No toast matching "${needle}" within ${timeout}ms.\nToasts seen: ${JSON.stringify(toasts)}\nAPI log:\n  ${apiSummary()}`
  );
};

const goto = async (path) => {
  await send('Page.navigate', { url: BASE + path });
  await waitFor('document.readyState === "complete"', `load ${path}`, 30000);
  await sleep(800); // let React mount
  await installToastRecorder();
};

let shotNo = 0;
const shot = async (name) => {
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 60 });
  const file = join(tmpdir(), `ui-smoke-${String(++shotNo).padStart(2, '0')}-${name}.jpg`);
  writeFileSync(file, Buffer.from(data, 'base64'));
  console.log(`    📸 ${file}`);
};

/** Set an input/textarea/select value the way React expects (native setter). */
const setValue = async (css, index, value) => {
  const expr = `(() => {
    const els = [...document.querySelectorAll(${JSON.stringify(css)})].filter(e => e.type !== 'file');
    const el = els[${index}];
    if (!el) return 'missing (matched ' + els.length + ')';
    const proto = el.tagName === 'SELECT' ? window.HTMLSelectElement.prototype
                : el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
    return 'ok';
  })()`;
  const r = await evaljs(expr);
  if (r !== 'ok') throw new Error(`setValue ${css}[${index}] → ${r}`);
  await sleep(150);
};

/** Click the first (or last) element matching a CSS selector + text predicate. */
const click = async (matcher, { css = 'button, a', label = matcher, last = false } = {}) => {
  const expr = `(() => {
    let els = [...document.querySelectorAll(${JSON.stringify(css)})];
    els = ${last ? 'els.reverse()' : 'els'};
    const el = els.find(e => ${matcher});
    if (!el) return false;
    el.click();
    return true;
  })()`;
  if (!(await evaljs(expr))) throw new Error(`Click target not found: ${label}`);
  await sleep(400);
};

// ---------------------------------------------------------------------------
const STAMP = Date.now().toString(36);
const STUDENT = {
  name: `Smoke Student ${STAMP}`,
  email: `smoke.${STAMP}@example.com`,
  password: 'password123',
  hostel: 'A Block',
  room: '212',
};
const COMMENT = 'UI smoke comment from the manager.';
let complaintId = null;

try {
  // Fresh session — a previous run may still be logged in, and guest-only
  // routes (register/login) would then bounce to the dashboard.
  await send('Page.navigate', { url: BASE + '/' });
  await waitFor('document.readyState === "complete"', 'load landing page', 30000);
  await sleep(600);
  await evaljs('localStorage.clear(); true');
  await installToastRecorder();

  // ================= STUDENT FLOW =================
  console.log('\n— Student flow —');
  await goto('/register');
  await setValue('form input:not([type=file])', 0, STUDENT.name);
  await setValue('form input:not([type=file])', 1, STUDENT.email);
  await setValue('form input:not([type=file])', 2, STUDENT.password);
  await setValue('form input:not([type=file])', 3, STUDENT.password);
  await setValue('form select', 0, STUDENT.hostel);
  await setValue('form input:not([type=file])', 4, STUDENT.room);
  await click(`e.textContent.includes('Create account')`, { label: 'Create account' });
  await waitFor(`location.pathname === '/student'`, 'register → /student');
  await waitForToast('Account created');
  check('register creates account, toast + lands on /student', true);
  await shot('student-dashboard');

  // File a complaint
  await click(`e.textContent.includes('New Complaint')`, { css: 'button', label: 'New Complaint' });
  await waitFor(`location.pathname === '/student/complaints/new'`, 'open complaint form');
  await setValue('form select', 0, 'Plumbing'); // category
  await sleep(300); // issue options populate
  await setValue('form select', 1, 'Water leakage'); // issue
  await sleep(300);
  check('auto-priority badge shows High for Water leakage', await bodyHas('High'));
  await setValue('form select', 2, STUDENT.hostel);
  await setValue('form input:not([type=file])', 0, STUDENT.room);
  await setValue('form textarea', 0, 'Automated UI smoke: water leaking under the washbasin.');
  await shot('student-new-complaint');
  await click(`e.textContent.includes('Submit Complaint')`, { label: 'Submit Complaint' });
  await waitFor(`location.pathname === '/student/complaints'`, 'create → My Complaints');
  await waitForToast('submitted successfully');

  complaintId = await evaljs(`(() => {
    const rows = [...document.querySelectorAll('table tr')].map(r => r.textContent);
    const hit = rows.find(t => /CMP-\\d{4}/.test(t));
    const m = hit && hit.match(/CMP-\\d{4}/);
    return m ? m[0] : null;
  })()`);
  check('new complaint appears in My Complaints', Boolean(complaintId), complaintId || 'no id found');
  await shot('student-my-complaints');

  // Open details
  await click(`e.textContent.includes('${complaintId}')`, { css: 'table tr', label: 'complaint row' });
  await waitFor(
    `location.pathname.startsWith('/student/complaints/')`,
    'student details page'
  );
  await waitFor(`document.body.innerText.toLowerCase().includes('status timeline')`, 'status timeline');
  check('student details page renders with status timeline', true);
  await shot('student-complaint-details');

  // Profile update (regression: used to log the user out)
  await goto('/profile');
  const newName = STUDENT.name + ' II';
  await setValue('form input:not([type=file])', 0, newName);
  await click(`e.textContent.includes('Save changes')`, { label: 'Save changes' });
  await waitForToast('Profile updated successfully');
  check('profile update toast shown', true);
  check('profile update keeps user logged in', (await currentPath()) === '/profile', await currentPath());
  check('updated name visible in UI', await bodyHas(newName));
  await shot('profile-updated');

  // ================= MANAGER FLOW =================
  console.log('\n— Manager flow —');
  await evaljs('localStorage.clear(); true');
  await goto('/login');
  await click(`e.textContent.includes('Manager demo')`, { label: 'Manager demo quick-fill' });
  await sleep(400);
  await click(`e.textContent.trim() === 'Log in'`, { label: 'Log in' });
  await waitFor(`location.pathname === '/manager'`, 'manager login → /manager');
  await waitForToast('Welcome back');
  await waitFor(`document.body.innerText.includes('Total Complaints')`, 'manager KPI cards');
  check('manager dashboard shows KPI cards', true);
  check(
    'manager dashboard lists complaint WITH student name',
    await bodyHas(STUDENT.name),
    'student name in recent table'
  );
  check('manager dashboard shows the complaint ID', await bodyHas(complaintId));
  await shot('manager-dashboard');

  // All complaints + search (regression: search filter crashed on studentName)
  await goto('/manager/complaints');
  await waitFor(`document.body.innerText.includes('All Complaints')`, 'All Complaints page');
  await setValue(`input[placeholder*='Search by ID']`, 0, STUDENT.name);
  await sleep(900); // debounce
  check('search by student name finds the complaint', await bodyHas(complaintId));
  await setValue(`input[placeholder*='Search by ID']`, 0, 'zzz-no-such-thing');
  await sleep(900);
  check('bogus search shows empty state', await bodyHas('No matching complaints'));
  await setValue(`input[placeholder*='Search by ID']`, 0, STUDENT.name);
  await sleep(900);
  await shot('manager-all-complaints-search');

  // Open details (regression: detail page crashed on populated studentId)
  await click(`e.textContent.includes('${complaintId}')`, { css: 'table tr', label: 'complaint row' });
  await waitFor(
    `location.pathname.startsWith('/manager/complaints/')`,
    'manager details page'
  );
  await waitFor(`document.body.innerText.includes('Manager actions')`, 'Manager actions panel');
  check('manager detail shows student name card', await bodyHas(STUDENT.name));
  check('manager detail shows student room', await bodyHas(STUDENT.room));
  await shot('manager-complaint-details');

  // Triage: status → priority → comment (each confirmed by its success toast,
  // which the server only sends after a 2xx round trip)
  await click(`e.textContent.includes('Start progress')`, { label: 'Start progress' });
  await waitForToast('Complaint moved to In Progress');
  check('status change accepted by server (toast)', true);

  await setValue('select', 0, 'critical');
  await waitForToast('Priority set to critical');
  await sleep(800); // let refetch land
  check(
    'priority override persisted after refetch',
    (await evaljs(`document.querySelectorAll('select')[0].value`)) === 'critical'
  );

  await setValue('textarea', 0, COMMENT);
  await click(`e.textContent.includes('Save comment')`, { label: 'Save comment' });
  await waitForToast('Comment saved');
  await sleep(800);
  check('manager comment rendered from server', await bodyHas(COMMENT));

  // Resolve → Reopen (regression: resolvedAt must clear on reopen)
  await click(`e.textContent.trim() === 'Resolve'`, { css: 'button', label: 'Resolve (card)' });
  await waitFor(
    `[...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Resolve').length === 2`,
    'resolve modal open'
  );
  await click(`e.textContent.trim() === 'Resolve'`, { css: 'button', label: 'Resolve (modal)', last: true });
  await waitForToast('Complaint marked as resolved');
  check('resolve accepted by server (toast)', true);
  await waitFor(`document.body.innerText.includes('Resolved on')`, 'resolved timestamp shown');
  check('resolution timestamp visible', true);
  await shot('manager-resolved');

  await click(`e.textContent.includes('Reopen')`, { label: 'Reopen' });
  await waitForToast('Complaint reopened');
  await sleep(600);
  check('reopen clears resolution timestamp', !(await bodyHas('Resolved on')));

  // Analytics + Students
  await goto('/manager/analytics');
  await waitFor(
    `document.body.innerText.includes('Complaints by category') && document.body.innerText.includes('Resolution statistics')`,
    'analytics page'
  );
  check('analytics renders charts and resolution stats', true);
  await shot('manager-analytics');

  await goto('/manager/students');
  await waitFor(`document.body.innerText.toLowerCase().includes('in progress')`, 'students page');
  check('students directory shows the new student', await bodyHas(STUDENT.email));
  check('students directory shows complaint stats', await bodyHas('Total'));
  await shot('manager-students');

  // ================= ROUND TRIP =================
  console.log('\n— Student sees the manager response —');
  await evaljs('localStorage.clear(); true');
  await goto('/login');
  await setValue('form input:not([type=file])', 0, STUDENT.email);
  await setValue('form input:not([type=file])', 1, STUDENT.password);
  await click(`e.textContent.trim() === 'Log in'`, { label: 'Log in (student)' });
  await waitFor(`location.pathname === '/student'`, 'student re-login');
  await waitForToast('Welcome back');
  await goto('/student/complaints');
  await click(`e.textContent.includes('${complaintId}')`, { css: 'table tr', label: 'complaint row' });
  await waitFor(
    `document.body.innerText.includes(${JSON.stringify(COMMENT)})`,
    'manager comment visible to student'
  );
  check('student sees manager comment on their complaint', true);
  await shot('student-sees-comment');

  console.log(`\n✅ UI smoke passed — ${checks.length} checks, ${shotNo} screenshots`);
  console.log(`\nAPI traffic:\n  ${apiSummary()}`);
} catch (error) {
  console.error(`\n❌ UI smoke failed: ${error.message}`);
  try {
    await shot('FAIL');
    console.error('--- page text at failure ---\n' + ((await bodyText()) || '').slice(0, 1200));
    console.error('--- toasts seen ---\n' + (await getToasts()));
  } catch {
    /* ignore */
  }
  console.error('--- API traffic ---\n  ' + apiSummary());
  process.exitCode = 1;
} finally {
  ws.close();
}
