const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
const MASTER_CODE = '59';
const RESOURCE_TYPES = new Set(['round', 'course']);

function reply(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function validCode(value: unknown) {
  return /^[0-9]{2}$/.test(String(value || ''));
}

function validRow(resourceType: string, row: Record<string, unknown>) {
  if (resourceType === 'round') {
    const pars = row.pars as Record<string, unknown> | unknown[];
    const parValues = Array.isArray(pars) ? pars : pars?.values;
    return Array.isArray(parValues) && parValues.length === 18
      && Array.isArray(row.players) && [3, 4].includes(row.players.length)
      && Array.isArray(row.scores) && row.scores.length === 18
      && row.totals !== null && typeof row.totals === 'object';
  }
  const pars = row.pars as Record<string, unknown> | unknown[];
  const parValues = Array.isArray(pars) ? pars : pars?.values;
  return typeof row.course_id === 'string' && typeof row.name === 'string'
    && Array.isArray(parValues) && parValues.length === 18;
}

function cleanRoundRow(raw: Record<string, unknown>) {
  const totals = raw.totals && typeof raw.totals === 'object' ? { ...(raw.totals as Record<string, unknown>) } : {};
  delete totals.editCode;
  return { ...raw, totals };
}

function cleanCourseRow(raw: Record<string, unknown>) {
  const pars = raw.pars && typeof raw.pars === 'object' && !Array.isArray(raw.pars)
    ? { ...(raw.pars as Record<string, unknown>) }
    : raw.pars;
  if (pars && typeof pars === 'object' && !Array.isArray(pars)) delete (pars as Record<string, unknown>).editCode;
  return { ...raw, pars };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return reply(405, { error: 'Method not allowed' });

  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  if (!supabaseUrl || !serviceKey) return reply(500, { error: 'Server write access is not configured' });

  let input: Record<string, unknown>;
  try {
    input = await request.json();
  } catch {
    return reply(400, { error: 'Invalid JSON body' });
  }

  const action = String(input.action || '');
  const resourceType = String(input.resourceType || '');
  const resourceId = String(input.resourceId || '');
  const syncKey = String(input.syncKey || '');
  const code = String(input.code || '');
  if (JSON.stringify(input).length > 250000 || !RESOURCE_TYPES.has(resourceType)
    || !resourceId.startsWith(`${syncKey}:${resourceType}:`) || resourceId.length > 240
    || !syncKey || syncKey.length > 80 || !validCode(code)) {
    return reply(400, { error: 'Invalid write request' });
  }

  const adminHeaders = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    'Content-Type': 'application/json'
  };
  const table = resourceType === 'round' ? 'vegas_rounds' : 'vegas_courses';
  const credentialUrl = `${supabaseUrl}/rest/v1/scorecard_credentials?resource_type=eq.${encodeURIComponent(resourceType)}&resource_id=eq.${encodeURIComponent(resourceId)}&select=edit_code,sync_key&limit=1`;
  const credentialResponse = await fetch(credentialUrl, { headers: adminHeaders });
  if (!credentialResponse.ok) return reply(502, { error: 'Credential lookup failed' });
  const credentials = await credentialResponse.json();
  const credential = Array.isArray(credentials) ? credentials[0] : null;
  const authorized = code === MASTER_CODE || (credential && credential.edit_code === code && credential.sync_key === syncKey);

  const source = `${request.headers.get('x-forwarded-for') || 'unknown'}|${request.headers.get('user-agent') || ''}|${resourceType}|${resourceId}`;
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  const failureKey = Array.from(new Uint8Array(digest)).map(value => value.toString(16).padStart(2, '0')).join('');
  const checkRateLimit = async (increment: boolean) => {
    const rateResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/scorecard_check_rate_limit`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ p_key: failureKey, p_increment: increment })
    });
    return rateResponse.ok && await rateResponse.json() === true;
  };
  if (!(await checkRateLimit(false))) return reply(429, { error: 'TOO_MANY_ATTEMPTS' });

  if (action === 'verify') {
    if (authorized) return reply(200, { ok: true });
    await checkRateLimit(true);
    return reply(403, { error: 'EDIT_CODE_INVALID' });
  }

  const isCreate = action === 'upsert' && !credential;
  if (!authorized && !isCreate) {
    await checkRateLimit(true);
    return reply(403, { error: 'EDIT_CODE_INVALID' });
  }

  if (isCreate) {
    const existingResponse = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(resourceId)}&select=id&limit=1`, { headers: adminHeaders });
    const existingRows = existingResponse.ok ? await existingResponse.json() : [];
    if (Array.isArray(existingRows) && existingRows.length && code !== MASTER_CODE) {
      await checkRateLimit(true);
      return reply(403, { error: 'EDIT_CODE_INVALID' });
    }
    const claimResponse = await fetch(`${supabaseUrl}/rest/v1/scorecard_credentials?on_conflict=resource_type,resource_id`, {
      method: 'POST',
      headers: { ...adminHeaders, Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ resource_type: resourceType, resource_id: resourceId, sync_key: syncKey, edit_code: code })
    });
    if (!claimResponse.ok) return reply(502, { error: 'Credential save failed' });
    const claimedResponse = await fetch(credentialUrl, { headers: adminHeaders });
    const claimedRows = claimedResponse.ok ? await claimedResponse.json() : [];
    const claimed = Array.isArray(claimedRows) ? claimedRows[0] : null;
    if (!claimed || claimed.edit_code !== code || claimed.sync_key !== syncKey) {
      return reply(409, { error: 'RESOURCE_ALREADY_EXISTS' });
    }
  }

  const row = input.row && typeof input.row === 'object' ? input.row as Record<string, unknown> : null;

  if (action === 'delete') {
    const deleteResponse = await fetch(
      `${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(resourceId)}&sync_key=eq.${encodeURIComponent(syncKey)}`,
      { method: 'DELETE', headers: { ...adminHeaders, Prefer: 'return=representation' } }
    );
    if (!deleteResponse.ok) return reply(deleteResponse.status, { error: await deleteResponse.text() || 'Delete failed' });
    const deleted = await deleteResponse.json();
    if (!Array.isArray(deleted) || deleted.length === 0) return reply(404, { error: 'RESOURCE_NOT_FOUND' });
    await fetch(
      `${supabaseUrl}/rest/v1/scorecard_credentials?resource_type=eq.${encodeURIComponent(resourceType)}&resource_id=eq.${encodeURIComponent(resourceId)}`,
      { method: 'DELETE', headers: adminHeaders }
    );
    return reply(200, { ok: true, deleted: deleted.length });
  }

  if (action !== 'upsert' || !row || row.id !== resourceId || row.sync_key !== syncKey || !validRow(resourceType, row)) {
    return reply(400, { error: 'Invalid resource payload' });
  }

  const cleaned = resourceType === 'round' ? cleanRoundRow(row) : cleanCourseRow(row);
  let writeUrl = `${supabaseUrl}/rest/v1/${table}?on_conflict=id`;
  let method = 'POST';
  let prefer = 'resolution=merge-duplicates,return=representation';
  if (resourceType === 'round' && !isCreate && Math.max(0, Number(input.expectedVersion || 0)) > 0) {
    const expectedVersion = Math.max(0, Number(input.expectedVersion || 0));
    cleaned.version = expectedVersion + 1;
    writeUrl = `${supabaseUrl}/rest/v1/vegas_rounds?id=eq.${encodeURIComponent(resourceId)}&sync_key=eq.${encodeURIComponent(syncKey)}&version=eq.${expectedVersion}`;
    method = 'PATCH';
    prefer = 'return=representation';
  } else if (resourceType === 'round') {
    cleaned.version = 1;
  }

  const writeResponse = await fetch(writeUrl, {
    method,
    headers: { ...adminHeaders, Prefer: prefer },
    body: JSON.stringify(cleaned)
  });
  if (!writeResponse.ok) return reply(writeResponse.status, { error: await writeResponse.text() || 'Write failed' });
  const rows = await writeResponse.json();
  if (!Array.isArray(rows) || rows.length === 0) return reply(409, { error: 'VERSION_CONFLICT' });

  return reply(200, { ok: true, row: rows[0] });
});
