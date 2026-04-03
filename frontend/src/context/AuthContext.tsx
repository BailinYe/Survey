import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/firebase/firebase";
import type { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  userId: string | null;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.uid || null,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
