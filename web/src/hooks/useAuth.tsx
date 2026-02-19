import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { api } from "@/lib/api";

type AppRole = "admin" | "operator" | "citizen";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  roles: AppRole[];
  isAdmin: boolean;
  isOperator: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const signIn = async (email: string, password: string) => {
    await api.post('/auth/login', { email, password });
    await fetchUser();
  };

  const signOut = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const roles = (user?.roles as AppRole[]) || [];

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        roles,
        isAdmin: roles.includes("admin"),
        isOperator: roles.includes("operator"),
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
