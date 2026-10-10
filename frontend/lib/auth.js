"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [state, setState] = useState({ user: null, meta: null, loading: true });

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    Promise.all([api.get("/auth/me"), api.get("/meta")])
      .then(([me, meta]) => setState({ user: me.user, meta, loading: false }))
      .catch(() => router.replace("/login"));
  }, [router]);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setToken(null);
    router.replace("/login");
  };

  return <AuthContext.Provider value={{ ...state, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
