import { useEffect, useState, useCallback } from 'react';

const CLERK_KEY = 'pk_live_Y2xlcmsudmF1bHRvZnNraWxscy5jb20k';

let clerkPromise = null;
let clerkLoaded = false;

function loadClerk() {
  if (clerkLoaded) return Promise.resolve(window.Clerk);
  if (clerkPromise) return clerkPromise;

  clerkPromise = new Promise((resolve, reject) => {
    const check = () => {
      if (window.Clerk) {
        window.Clerk.load({ publishableKey: CLERK_KEY })
          .then(() => { clerkLoaded = true; resolve(window.Clerk); })
          .catch(reject);
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
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timer = null;

    loadClerk().then((clerk) => {
      if (!mounted) return;
      refresh();

      // Clerk addListener for auth changes
      if (clerk.addListener) {
        clerk.addListener(() => {
          if (mounted) refresh();
        });
      }

      // Fallback polling every 500ms for 10s
      let attempts = 0;
      timer = setInterval(() => {
        attempts++;
        if (window.Clerk && window.Clerk.loaded) {
          if (mounted) refresh();
        }
        if (attempts >= 20) {
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
