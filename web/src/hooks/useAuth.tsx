import { useState, useEffect } from "react";
import { auth } from "../utils/firebase";
import type { User } from "firebase/auth";
import { set } from "lodash";

export function useAuth() {
  const [authState, setAuthState] = useState<{
    isSignedIn: Boolean;
    pending: Boolean;
    user: User | null;
  }>({
    isSignedIn: false,
    pending: true,
    user: null,
  });

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) =>
      setAuthState({ user, pending: false, isSignedIn: !!user })
    );
    return () => unregisterAuthObserver();
  }, []);

  return { auth, ...authState };
}
