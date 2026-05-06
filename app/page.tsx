"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Pi: any;
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      window.Pi.init({
        version: "2.0",
        sandbox: true,
      });
    }
  }, []);

  const loginWithPi = async () => {
    try {
      const scopes = ["payments", "username"];

      const auth = await window.Pi.authenticate(
        scopes,
        onIncompletePaymentFound
      );

      setUser(auth.user);
    } catch (error) {
      console.error(error);
      alert("فشل تسجيل الدخول");
    }
  };

  const onIncompletePaymentFound = async (payment: any) => {
    console.log("Incomplete payment found", payment);
  };

  const pay = async () => {
    try {
      if (!window.Pi) {
        alert("افتح التطبيق داخل Pi Browser");
        return;
      }

      setLoading(true);

      const paymentData = {
        amount: 0.1,
        memo: "اختبار الدفع",
        metadata: {
          productId: "test-product",
        },
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log("Approving payment:", paymentId);

          await fetch(
            "https://YOUR_PROJECT.supabase.co/functions/v1/approve-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId,
              }),
            }
          );
        },

        onReadyForServerCompletion: async (
          paymentId: string,
          txid: string
        ) => {
          console.log("Completing payment:", paymentId);

          await fetch(
            "https://YOUR_PROJECT.supabase.co/functions/v1/complete-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId,
                txid,
              }),
            }
          );
        },

        onCancel: function (paymentId: string) {
          console.log("Payment cancelled", paymentId);
          setLoading(false);
        },

        onError: function (error: any, payment: any) {
          console.error(error);
          console.log(payment);
          setLoading(false);
          alert("فشل الدفع");
        },
      };

      await window.Pi.createPayment(paymentData, callbacks);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ");
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f5f5",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#fff",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop"
          alt="product"
          style={{
            width: "100%",
            borderRadius: "20px",
            height: "320px",
            objectFit: "cover",
          }}
        />

        <h1
          style={{
            fontSize: "42px",
            fontWeight: "bold",
            marginTop: "20px",
            textAlign: "right",
          }}
        >
          منتج تجريبي
        </h1>

        <p
          style={{
            color: "#666",
            textAlign: "right",
            fontSize: "22px",
          }}
        >
          اختبار الدفع بـ Pi
        </p>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            color: "#7b00ff",
            fontSize: "60px",
            fontWeight: "bold",
          }}
        >
          Pi 0.1
        </div>

        {!user ? (
          <button
            onClick={loginWithPi}
            style={{
              width: "100%",
              marginTop: "25px",
              background: "#5e17eb",
              color: "#fff",
              border: "none",
              padding: "18px",
              borderRadius: "14px",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            تسجيل الدخول بـ Pi
          </button>
        ) : (
          <button
            onClick={pay}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "25px",
              background: "#7b00ff",
              color: "#fff",
              border: "none",
              padding: "18px",
              borderRadius: "14px",
              fontSize: "24px",
              cursor: "pointer",
            }}
          >
            {loading ? "جاري فتح الدفع..." : "ادفع الآن"}
          </button>
        )}

        {user && (
          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#444",
            }}
          >
            مرحبًا {user.username}
          </p>
        )}
      </div>
    </main>
  );
}
