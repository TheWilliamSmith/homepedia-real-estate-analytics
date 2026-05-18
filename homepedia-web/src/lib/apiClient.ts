const BASE_URL = process.env.API_BASE_URL;

if (!BASE_URL) {
  throw new Error("Missing env variable: API_BASE_URL");
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { cache: "no-store", ...init });

  if (!res.ok) {
    throw new Error(`API error ${res.status} — ${res.statusText} (${url})`);
  }

  return res;
}
