// Arc Tracker lock. Shows the "enter your licence key" screen until the key checks out with
// /api/arc-verify, then loads the tracker. The key is re-checked on every visit, so an ended
// membership locks again. A recent successful check lets the tracker open offline for a few days.
(() => {
  const KEY = 'arc_license', CHECKED = 'arc_license_checked';
  const GRACE_MS = 3 * 24 * 60 * 60 * 1000;
  // On preview and local addresses only, a sample key opens the tracker so the flow can be tried
  // before real purchases exist. It does nothing on the live domain.
  const isLive = /(^|\.)joinkaminari\.com$/.test(location.hostname);
  const SAMPLE_KEY = 'ARC7-K2MQ-9XTD-4HPL';

  const gate = document.getElementById('arc-gate'), app = document.getElementById('arc-app');
  const form = document.getElementById('arc-gate-form'), input = document.getElementById('arc-key');
  const msg = document.getElementById('arc-gate-msg'), btn = document.getElementById('arc-unlock');
  const get = k => { try { return localStorage.getItem(k); } catch { return null; } };
  const set = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch {} };

  const REASONS = {
    invalid_key: "That key isn't valid. Check it and try again.",
    refunded: 'That purchase was refunded, so its key no longer works.',
    membership_ended: 'That membership has ended. Subscribe again to pick your arc back up.',
    not_configured: "Key checking isn't connected yet. Try again soon.",
    gumroad_unreachable: "Couldn't reach the licence check. Try again in a moment.",
  };

  let loaded = false;
  function open() {
    gate.hidden = true;
    if (loaded) { app.hidden = false; return; }
    loaded = true;
    // the tracker stays hidden until its script has run, so its opening screen is the first thing seen
    const s = document.createElement('script'); s.src = '/arc-tracker.js';
    s.onload = s.onerror = () => { if (gate.hidden) app.hidden = false; };
    document.body.appendChild(s);
  }
  function lock(text) {
    app.hidden = true; gate.hidden = false;
    msg.textContent = text || '';
    btn.disabled = false; btn.textContent = 'Unlock';
  }

  async function check(key) {
    if (!isLive && key.toUpperCase() === SAMPLE_KEY) return { ok: true };
    try {
      const res = await fetch('/api/arc-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key }) });
      return await res.json();
    } catch { return { ok: false, reason: 'offline' }; }
  }

  async function tryKey(key, fromForm) {
    const result = await check(key);
    if (result.ok) { set(KEY, key); set(CHECKED, String(Date.now())); return open(); }
    const recent = Date.now() - Number(get(CHECKED) || 0) < GRACE_MS;
    const cantTell = ['offline', 'gumroad_unreachable', 'not_configured'].includes(result.reason);
    if (!fromForm && cantTell && recent) return open();
    if (!cantTell) { set(KEY, null); set(CHECKED, null); }
    lock(result.reason === 'offline' ? "You're offline. Connect to unlock your tracker." : REASONS[result.reason] || REASONS.invalid_key);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const key = input.value.trim();
    if (!key) { msg.textContent = 'Enter your licence key first.'; return; }
    btn.disabled = true; btn.textContent = 'Checking…'; msg.textContent = '';
    tryKey(key, true);
  });
  input.addEventListener('input', () => { msg.textContent = ''; });
  document.getElementById('arc-preview-note').hidden = isLive;
  document.getElementById('arc-preview-open').addEventListener('click', () => { if (!isLive) tryKey(SAMPLE_KEY, true); });

  // Invite links look like /arc-tracker/app#key=XXXX. The key rides in the part after #, which
  // browsers never send to the server, and is removed from the address bar once read.
  const invited = new URLSearchParams(location.hash.slice(1)).get('key');
  if (invited) history.replaceState(null, '', location.pathname + location.search);

  const saved = invited || get(KEY);
  if (saved) { if (invited) input.value = invited; tryKey(saved, !!invited); } else lock('');
})();
