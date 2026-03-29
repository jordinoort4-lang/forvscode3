import { getSupabase } from './supabase';

const FN_BASE = '/functions/v1';

async function getAccessToken() {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

export async function activateAccount(params: {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  pwaInstalledVerified: boolean;
  emailSubscriptionActive: boolean;
}) {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${FN_BASE}/activate-account`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? 'Failed to activate account');
  }
  return json;
}

export async function fetchCalcPermission() {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${FN_BASE}/calc-permission`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? 'Failed to fetch permission');
  }
  return json;
}

export async function recordCalcUsage() {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${FN_BASE}/calc-permission`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'record' }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.success) {
    throw new Error(json?.error ?? 'Failed to record usage');
  }
  return json;
}
