'use client';

import { useEffect } from 'react';

export default function ClientAuthSync() {
  useEffect(() => {
    // 1. Listen for auth-change to sync local tokens
    const handleAuthChange = () => {
      fetch('/api/auth/me')
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) {
            localStorage.setItem('eyedea_user_cache', JSON.stringify(data.user));
          }
        })
        .catch(() => {});
    };

    window.addEventListener('auth-change', handleAuthChange);

    // 2. On mount, verify if session is active or needs background sync
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then(async (data) => {
        if (!data?.user) {
          const sessionToken = localStorage.getItem('eyedea_session_token');
          const vaultToken = localStorage.getItem('eyedea_vault_token');

          if (sessionToken || vaultToken) {
            try {
              const syncRes = await fetch('/api/auth/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: sessionToken, vaultToken }),
              });
              if (syncRes.ok) {
                const syncData = await syncRes.json();
                if (syncData?.user) {
                  localStorage.setItem('eyedea_user_cache', JSON.stringify(syncData.user));
                  window.dispatchEvent(new Event('auth-change'));
                }
              }
            } catch {
              // ignore sync failure
            }
          }
        } else {
          localStorage.setItem('eyedea_user_cache', JSON.stringify(data.user));
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  return null;
}
