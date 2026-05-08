"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PiUser {
  uid: string;
  username: string;
}

interface PiAuthContextType {
  user: PiUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PiUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    if (!window.Pi) {
      alert("❌ يرجى فتح هذا التطبيق من Pi Browser");
      return;
    }

    setIsLoading(true);

    try {
      // تهيئة SDK
      window.Pi.init({
        version: "2.0",
        sandbox: process.env.NEXT_PUBLIC_PI_NETWORK === 'testnet'
      });

      // المصادقة
      const auth = await window.Pi.authenticate(
        ['username'],
        (payment: any) => {
          console.log("Incomplete payment:", payment);
        }
      );

      setUser({
        uid: auth.user.uid,
        username: auth.user.username
      });

      alert(`✅ مرحباً ${auth.user.username}!`);

    } catch (error: any) {
      alert("❌ فشل تسجيل الدخول: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    alert("👋 تم تسجيل الخروج");
  };

  return (
    <PiAuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (!context) throw new Error("usePiAuth must be used within PiAuthProvider");
  return context;
}
