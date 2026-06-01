import { useState, useCallback } from "react";
import { getCurrentUser, clearAuth, type User } from "../api/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(getCurrentUser);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(() => {
    setUser(getCurrentUser());
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  const isAdmin = user?.role === "owner";
  const isPenghuni = user?.role === "penghuni";
  const isLoggedIn = !!user;

  return { user, isAdmin, isPenghuni, isLoggedIn, isLoading, setIsLoading, refetch, logout };
}
