import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { auth } from "../utils/firebase";
import type { User } from "firebase/auth";

// Define shape of auth state
type AuthState = {
  isSignedIn: boolean;
  pending: boolean;
  user: User | null;
};

// Create context
const AuthContext = createContext<
  (AuthState & { auth: typeof auth }) | undefined
>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isSignedIn: false,
    pending: true,
    user: null,
  });

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged((user) =>
      setAuthState({
        user,
        pending: false,
        isSignedIn: !!user,
      })
    );
    return () => unregisterAuthObserver();
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, auth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
