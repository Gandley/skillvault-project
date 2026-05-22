import { useEffect, useState, useCallback } from 'react';

const CLERK_KEY = 'pk_test_bWF4aW11bS1tYW1tYWwtMzcuY2xlcmsuYWNjb3VudHMuZGV2JA';

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
      setIsSignedIn(window.Clerk.user !== null);
      setUser(window.Clerk.user);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClerk().then(() => {
      refresh();
      window.Clerk.addListener(() => refresh());
    }).catch(() => setIsLoading(false));
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
