import React, { useCallback, useEffect, useState } from 'react';

type AdRecord = {
  id: string;
  title: string;
  advertiser: string;
  description: string;
  image_url: string;
  destination_url: string;
  kind: 'affiliate' | 'direct';
  status: 'active' | 'paused';
  starts_at: string | null;
  ends_at: string | null;
  impressions: number;
  clicks: number;
};

type AdForm = {
  title: string;
  advertiser: string;
  description: string;
  image_url: string;
  destination_url: string;
  kind: 'affiliate' | 'direct';
  status: 'active' | 'paused';
  starts_at: string;
  ends_at: string;
};

const EMPTY_FORM: AdForm = {
  title: '', advertiser: '', description: '', image_url: '', destination_url: '',
  kind: 'direct', status: 'paused', starts_at: '', ends_at: '',
};

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100';
const labelClass = 'mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600';

export const AdsAdminDashboard: React.FC = () => {
  const [token, setToken] = useState(() => sessionStorage.getItem('aes_ads_admin_token') || '');
  const [tokenInput, setTokenInput] = useState('');
  const [ads, setAds] = useState<AdRecord[]>([]);
  const [form, setForm] = useState<AdForm>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const request = useCallback(async (path: string, init: RequestInit = {}) => {
    const response = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
        ...(init.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || 'Request failed (' + response.status + ')');
    return body;
  }, [token]);

  const loadAds = useCallback(async () => {
    if (!token) return;
    setBusy(true);
    setError('');
    try {
      const result = await request('/api/admin/ads');
      setAds(Array.isArray(result.ads) ? result.ads : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load advertisements');
    } finally {
      setBusy(false);
    }
  }, [request, token]);

  useEffect(() => { if (token) loadAds(); }, [token, loadAds]);

  const login = async (event: React.FormEvent) => {
    event.preventDefault();
    const candidate = tokenInput.trim();
    if (!candidate) return;
    setToken(candidate);
    sessionStorage.setItem('aes_ads_admin_token', candidate);
    setTokenInput('');
  };

  const logout = () => {
    sessionStorage.removeItem('aes_ads_admin_token');
    setToken('');
    setAds([]);
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const updateField = (field: keyof AdForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value } as AdForm));
  };

  const saveAd = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const payload = {
        ...form,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };
      if (editingId) {
        await request('/api/admin/ads/' + encodeURIComponent(editingId), { method: 'PUT', body: JSON.stringify(payload) });
        setNotice('Advertisement updated.');
      } else {
        await request('/api/admin/ads', { method: 'POST', body: JSON.stringify(payload) });
        setNotice('Advertisement created.');
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
      await loadAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save advertisement');
    } finally {
      setBusy(false);
    }
  };

  const editAd = (ad: AdRecord) => {
    setEditingId(ad.id);
    setForm({
      title: ad.title,
      advertiser: ad.advertiser,
      description: ad.description,
      image_url: ad.image_url,
      destination_url: ad.destination_url,
      kind: ad.kind,
      status: ad.status,
      starts_at: ad.starts_at ? new Date(ad.starts_at).toISOString().slice(0, 16) : '',
      ends_at: ad.ends_at ? new Date(ad.ends_at).toISOString().slice(0, 16) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStatus = async (ad: AdRecord) => {
    try {
      await request('/api/admin/ads/' + encodeURIComponent(ad.id), {
        method: 'PUT',
        body: JSON.stringify({ ...ad, status: ad.status === 'active' ? 'paused' : 'active' }),
      });
      await loadAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status');
    }
  };

  const deleteAd = async (ad: AdRecord) => {
    if (!window.confirm('Delete "' + ad.title + '"? This cannot be undone.')) return;
    try {
      await request('/api/admin/ads/' + encodeURIComponent(ad.id), { method: 'DELETE' });
      setNotice('Advertisement deleted.');
      await loadAds();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete advertisement');
    }
  };

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071120] px-5 py-12">
        <form onSubmit={login} className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0B192C] p-7 text-white shadow-2xl">
          <a href="/" className="text-xs font-bold text-sky-300">← Ananya Electrical Solutions</a>
          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Private workspace</p>
          <h1 className="mt-2 text-2xl font-extrabold">Advertising Manager</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">Enter the private admin token configured in your Cloudflare Worker secrets. This token is not your Cloudflare password.</p>
          <label className="mt-6 block text-xs font-bold text-slate-300" htmlFor="admin-token">Admin token</label>
          <input id="admin-token" type="password" autoComplete="current-password" value={tokenInput} onChange={(event) => setTokenInput(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-3 text-sm text-white outline-none focus:border-sky-400" />
          <button className="mt-4 w-full rounded-lg bg-[#F59E0B] px-4 py-3 text-sm font-extrabold text-[#2a1700] hover:bg-amber-400">Sign in</button>
          <p className="mt-4 text-[11px] text-slate-400">Use HTTPS. Your token is held in this browser tab session and is cleared when you sign out.</p>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#071120] p-5 text-white shadow-lg">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400">Ananya Electrical Solutions</p><h1 className="mt-1 text-2xl font-extrabold">Advertising Manager</h1><p className="mt-1 text-xs text-slate-300">Manage homepage banners, affiliate placements and sponsor campaigns.</p></div>
          <div className="flex gap-2"><a href="/" className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-bold hover:bg-slate-800">View website</a><button onClick={logout} className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-bold hover:bg-slate-600">Sign out</button></div>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[['Campaigns', String(ads.length)], ['Impressions', totalImpressions.toLocaleString()], ['Clicks', totalClicks.toLocaleString()]].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-extrabold text-[#0B192C]">{value}</p></div>
          ))}
        </div>

        {(error || notice) && <div role="status" className={'mb-5 rounded-lg border px-4 py-3 text-sm ' + (error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700')}>{error || notice}</div>}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
          <form onSubmit={saveAd} className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-extrabold">{editingId ? 'Edit campaign' : 'Create campaign'}</h2>{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM); }} className="text-xs font-bold text-sky-700">Cancel edit</button>}</div>
            <label className={labelClass}>Campaign title</label><input required maxLength={120} value={form.title} onChange={(e) => updateField('title', e.target.value)} className={inputClass} placeholder="LED lighting range" />
            <label className={labelClass + ' mt-3'}>Advertiser / brand</label><input required maxLength={100} value={form.advertiser} onChange={(e) => updateField('advertiser', e.target.value)} className={inputClass} placeholder="Brand name" />
            <label className={labelClass + ' mt-3'}>Short description</label><textarea required maxLength={300} rows={3} value={form.description} onChange={(e) => updateField('description', e.target.value)} className={inputClass} placeholder="Describe the product or offer" />
            <label className={labelClass + ' mt-3'}>Banner image URL (HTTPS)</label><input required type="url" value={form.image_url} onChange={(e) => updateField('image_url', e.target.value)} className={inputClass} placeholder="https://brand.example/banner.jpg" />
            <label className={labelClass + ' mt-3'}>Destination / affiliate URL (HTTPS)</label><input required type="url" value={form.destination_url} onChange={(e) => updateField('destination_url', e.target.value)} className={inputClass} placeholder="https://shop.example/product?ref=..." />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><label className={labelClass}>Revenue type</label><select value={form.kind} onChange={(e) => updateField('kind', e.target.value)} className={inputClass}><option value="direct">Direct sponsor</option><option value="affiliate">Affiliate</option></select></div>
              <div><label className={labelClass}>Status</label><select value={form.status} onChange={(e) => updateField('status', e.target.value)} className={inputClass}><option value="paused">Paused</option><option value="active">Active</option></select></div>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div><label className={labelClass}>Start (optional)</label><input type="datetime-local" value={form.starts_at} onChange={(e) => updateField('starts_at', e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>End (optional)</label><input type="datetime-local" value={form.ends_at} onChange={(e) => updateField('ends_at', e.target.value)} className={inputClass} /></div>
            </div>
            <button disabled={busy} className="mt-5 w-full rounded-lg bg-[#0284C7] px-4 py-3 text-sm font-extrabold text-white hover:bg-[#006398] disabled:opacity-50">{busy ? 'Saving…' : editingId ? 'Save changes' : 'Create campaign'}</button>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">Use only images and brand assets you own or are authorised to display. Keep affiliate links and sponsored placements accurately labelled.</p>
          </form>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-lg font-extrabold">Campaign inventory</h2><p className="text-xs text-slate-500">Impressions are counted when a banner enters the visible viewport. Clicks use tracked redirect links.</p></div><button onClick={loadAds} disabled={busy} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold hover:bg-slate-50">Refresh</button></div>
            {busy && ads.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">Loading campaigns…</p> : ads.length === 0 ? <p className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">No campaigns yet. Create the first one using the form.</p> : (
              <div className="space-y-3">
                {ads.map((ad) => (
                  <article key={ad.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row">
                    <img src={ad.image_url} alt="" className="h-24 w-full rounded-lg bg-slate-100 object-cover sm:w-36" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-[#0B192C]">{ad.title}</h3><span className={'rounded-full px-2 py-0.5 text-[10px] font-bold ' + (ad.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{ad.status}</span><span className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-700">{ad.kind}</span></div>
                      <p className="mt-1 text-xs text-slate-500">{ad.advertiser} · {ad.impressions.toLocaleString()} impressions · {ad.clicks.toLocaleString()} clicks</p>
                      <div className="mt-3 flex flex-wrap gap-2"><button onClick={() => editAd(ad)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold">Edit</button><button onClick={() => toggleStatus(ad)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-bold">{ad.status === 'active' ? 'Pause' : 'Activate'}</button><button onClick={() => deleteAd(ad)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">Delete</button></div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-500">Google AdSense is configured separately using approved publisher and ad-unit IDs in the Vite build environment.</p>
      </div>
    </main>
  );
};
