export const API_BASE = 'https://kisan-ai-production-aab8.up.railway.app';

export async function apiFetch(path) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(API_BASE + path, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return { _error: true, _status: res.status };
    return await res.json();
  } catch (e) {
    return { _error: true, _message: e.message };
  }
}

export const fmt = (n) => Math.round(n).toLocaleString('en-IN');
export const fmtKg = (qtl) => Math.round(qtl / 100);
