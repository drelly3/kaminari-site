// Checks an Arc Tracker licence key with Gumroad. Runs on the server so the check can't be skipped
// by editing the page, and so a cancelled or refunded membership stops unlocking the tracker.
//
// Needs one setting on the host: GUMROAD_PRODUCT_ID (Gumroad > Arc Tracker > Content > licence key block).
// Optional: ARC_TESTER_KEYS, a comma-separated list of invite keys that unlock the tracker for free
// (for test runs). Remove a key from the list, or delete the setting, to switch that access off.
export async function verifyLicense(key, productId = process.env.GUMROAD_PRODUCT_ID, testerKeys = process.env.ARC_TESTER_KEYS) {
  key = String(key || '').trim();
  if (!key || key.length > 80) return { status: 400, body: { ok: false, reason: 'missing_key' } };
  const testers = String(testerKeys || '').split(',').map(k => k.trim().toUpperCase()).filter(Boolean);
  if (testers.includes(key.toUpperCase())) return { status: 200, body: { ok: true, tester: true } };
  if (!productId) return { status: testers.length ? 200 : 503, body: { ok: false, reason: testers.length ? 'invalid_key' : 'not_configured' } };

  let data;
  try {
    const res = await fetch('https://api.gumroad.com/v2/licenses/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ product_id: productId, license_key: key, increment_uses_count: 'false' }),
    });
    data = await res.json();
  } catch {
    return { status: 502, body: { ok: false, reason: 'gumroad_unreachable' } };
  }

  if (!data.success) return { status: 200, body: { ok: false, reason: 'invalid_key' } };
  const p = data.purchase || {};
  if (p.refunded || p.chargebacked || p.disputed) return { status: 200, body: { ok: false, reason: 'refunded' } };
  // a cancelled membership keeps working until the paid period ends; ended or failed payments lock it
  if (p.subscription_ended_at || p.subscription_failed_at) return { status: 200, body: { ok: false, reason: 'membership_ended' } };
  return { status: 200, body: { ok: true } };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const out = await verifyLicense(body.key);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(out.status).json(out.body);
}
