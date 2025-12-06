// Admin autentifikatsiya funksiyalari

export function getAdminCredentials(): { login: string; password: string } | null {
  if (typeof window === 'undefined') return null;

  const login = localStorage.getItem('adminLogin');
  const password = localStorage.getItem('adminPassword');

  if (!login || !password) return null;

  return { login, password };
}

export function clearAdminCredentials() {
  if (typeof window === 'undefined') return;

  localStorage.removeItem('adminLogin');
  localStorage.removeItem('adminPassword');
}

export function isAdminAuthenticated(): boolean {
  return getAdminCredentials() !== null;
}
