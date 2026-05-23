import { useEffect, useState, useCallback } from 'react';

const CLERK_KEY = 'pk_test_bWF4aW11bS1tYW1tYWwtMzcuY2xlcmsuYWNjb3VudHMuZGV2JA';
const CLERK_HOSTED_SIGNIN = 'https://maximum-mammal-37.accounts.dev/sign-in';
const CLERK_HOSTED_SIGNUP = 'https://maximum-mammal-37.accounts.dev/sign-up';

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
    const returnUrl = encodeURIComponent(returnPath || window.location.href);
    window.location.href = `${CLERK_HOSTED_SIGNIN}?redirect_url=${returnUrl}`;
  }, []);

  const signUpRedirect = useCallback((returnPath) => {
    const returnUrl = encodeURIComponent(returnPath || window.location.href);
    window.location.href = `${CLERK_HOSTED_SIGNUP}?redirect_url=${returnUrl}`;
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
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `${CLERK_HOSTED_SIGNIN}?redirect_url=${returnUrl}`;
    return false;
  }
  return true;
}
