import { useEffect, useState, useCallback } from 'react';
import { upsertUserProfile } from './supabase';

const CLERK_KEY = 'pk_live_Y2xlcmsudmF1bHRvZnNraWxscy5jb20k';

let clerkPromise = null;
let clerkLoaded = false;

function loadClerk() {
  if (clerkLoaded) return Promise.resolve(window.Clerk);
  if (clerkPromise) return clerkPromise;

  // Check if Clerk script tag exists
  const clerkScript = document.querySelector('script[src*="clerk.browser.js"]');
  if (!clerkScript) {
    return Promise.reject(new Error('Clerk script tag not found'));
  }

  clerkPromise = new Promise((resolve, reject) => {
    const startTime = Date.now();
    const timeout = 30000;
    let loadAttempted = false;

    const check = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Clerk failed to load within 30 seconds'));
        return;
      }

      if (window.Clerk) {
        if (window.Clerk.loaded) {
          clerkLoaded = true;
          resolve(window.Clerk);
        } else if (!loadAttempted) {
          loadAttempted = true;
          window.Clerk.load({ publishableKey: CLERK_KEY })
            .then(() => {
              clerkLoaded = true;
              resolve(window.Clerk);
            })
            .catch((err) => {
              console.error('[Auth] Clerk.load() failed:', err);
              setTimeout(check, 500);
            });
        } else {
          setTimeout(check, 100);
        }
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });

  return clerkPromise;
}

export function useClerkAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    if (window.Clerk && window.Clerk.loaded) {
      const clerkUser = window.Clerk.user;
      const hasUser = clerkUser != null;
      setIsSignedIn(hasUser);
      setUser(clerkUser || null);
      setIsLoading(false);
      console.log('[Auth] Refresh — signedIn:', hasUser, 'user:', clerkUser?.primaryEmailAddress?.emailAddress || 'none');

      // Sync user to Supabase
      if (hasUser && clerkUser) {
        upsertUserProfile({
          userId: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress,
          name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : undefined,
          avatarUrl: clerkUser.imageUrl,
        }).catch((err) => {
          console.error('[Auth] Supabase sync failed:', err);
        });
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timer = null;
    let listenerCleanup = null;

    loadClerk().then((clerk) => {
      if (!mounted) return;
      refresh();

      // Set up Clerk listener for auth changes
      if (clerk.addListener) {
        listenerCleanup = clerk.addListener((event) => {
          if (mounted) {
            console.log('[Auth] Clerk event:', event?.user?.id ? 'user changed' : 'no user');
            refresh();
          }
        });
      }

      // Aggressive fallback polling every 500ms for 15s
      let attempts = 0;
      timer = setInterval(() => {
        attempts++;
        if (window.Clerk && window.Clerk.loaded) {
          if (mounted) refresh();
        }
        if (attempts >= 30) {
          clearInterval(timer);
          if (mounted) setIsLoading(false);
        }
      }, 500);
    }).catch((err) => {
      console.error('[Auth] Clerk load error:', err);
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      if (timer) clearInterval(timer);
      if (listenerCleanup && typeof listenerCleanup === 'function') {
        listenerCleanup();
      }
    };
  }, [refresh]);

  const signInRedirect = useCallback((returnPath) => {
    const url = `/login.html?return_url=${encodeURIComponent(returnPath || window.location.pathname)}`;
    window.location.href = url;
  }, []);

  const signUpRedirect = useCallback((returnPath) => {
    const url = `/signup.html?return_url=${encodeURIComponent(returnPath || window.location.pathname)}`;
    window.location.href = url;
  }, []);

  const signOut = useCallback(() => {
    if (window.Clerk && window.Clerk.signOut) {
      window.Clerk.signOut();
    }
  }, []);

  return { isSignedIn, user, isLoading, signInRedirect, signUpRedirect, signOut };
}

export function requireAuth(action, tier) {
  if (tier === 'free') return true;
  if (!window.Clerk || !window.Clerk.user) {
    const returnUrl = window.location.pathname + window.location.search;
    window.location.href = `/login.html?return_url=${encodeURIComponent(returnUrl)}`;
    return false;
  }
  return true;
}
