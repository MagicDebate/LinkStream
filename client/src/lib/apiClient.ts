const API_BASE: string = (import.meta.env?.VITE_API_BASE as string) || '/api';

export async function getHealth(): Promise<{ ok: boolean }> {
  const res = await fetch(`${API_BASE}/health`, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }
  return res.json();
}

export const apiClient = {
  getHealth,
};


