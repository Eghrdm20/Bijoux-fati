"use client";

import { usePiAuth } from "@/contexts/PiAuthContext";

export default function PiLoginButton() {
  const { user, isLoading, isAuthenticated, login, logout } = usePiAuth();

  if (isLoading) {
    return (
      <button disabled style={{
        padding: "10px 20px",
        backgroundColor: "#ccc",
        border: "none",
        borderRadius: "8px",
        cursor: "not-allowed"
      }}>
        ⏳ جاري التحميل...
      </button>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "10px"
      }}>
        <span>👤 {user.username}</span>
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          خروج
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={login}
      style={{
        padding: "10px 20px",
        backgroundColor: "#8b5cf6",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      🔐 تسجيل الدخول عبر Pi
    </button>
  );
}
