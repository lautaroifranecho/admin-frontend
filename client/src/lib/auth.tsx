import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface AdminUser {
  id: number;
  email: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AdminUser>;
  signOut: () => void;
  verify2FA: (code: string) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const storedSession = localStorage.getItem('adminSession');
    const storedToken = localStorage.getItem('token');
  
    async function validateToken(token: string) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error();
        const data = await res.json();
        console.log(data);
        setUser(data.admin);
        setToken(token);
      } catch {
        setUser(null);
        setToken(null);
        localStorage.removeItem('adminSession');
        localStorage.removeItem('token');
        setLocation("/login");
      } finally {
        setIsLoading(false);
      }
    }
  
    if (storedSession) {
      const parsedSession = JSON.parse(storedSession);
      validateToken(parsedSession.token);
    } else if (storedToken) {
      validateToken(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials');
      }

      const data = await response.json();
      const adminUser: AdminUser = {
        id: data.admin.id,
        email: data.admin.email
      };

      const newSession = { user: adminUser, token: data.token };
      setToken(data.token);
      setUser(adminUser);
      
      localStorage.setItem('token', data.token);
      
      if (rememberMe) {
        localStorage.setItem('adminSession', JSON.stringify(newSession));
      }

      return adminUser;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('adminSession');
    localStorage.removeItem('token');
    setLocation("/login");
  };

  const verify2FA = async (code: string) => {
    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid 2FA code');
      }

      const data = await response.json();
      setToken(data.token);
      setLocation("/dashboard");
    } catch (error) {
      console.error("2FA verification error:", error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    signIn,
    signOut,
    verify2FA,
    isAuthenticated: !!user && !!token,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
