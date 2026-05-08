"use client";

import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface PiPaymentProps {
  product: Product;
  quantity: number;
}

export default function PiPayment({ product, quantity }: PiPaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      setIsPiBrowser(true);
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // التحقق من Pi Browser
      if (!window.Pi) {
        alert("❌ يرجى فتح هذا التطبيق من Pi Browser");
        setError("Not in Pi Browser");
        return;
      }

      // ✅ تهيئة Pi SDK - ضروري جداً!
      alert("🔵 جاري ته // ✅ تهيئة Pi SDK - ضروري جداً!
      alert("🔵 جاري تهيئة Pi SDK...");
      
      window.Pi.init({
        version: "2.0",
        sandbox: process.env.NEXT_PUBLIC_PI_NETWORK === 'testnet'
      });
      
      alert("✅ تم تهيئة Pi SDK");

      // الخطوة 1: المصادقة
      alert("🔵 الخطوة 1: جاري المصادقة...");

      const auth = await window.Pi.authenticate(
        ["payments", "username"],
        (payment: any) => {
          console.log("Incomplete payment found:", payment);
          alert("⚠️ وجدنا دفعة سابقة غير مكتملة");
        }
      );

      const userId = auth.user.uid;
      alert("✅ تم المصادقة! المستخدم: " + auth.user.username);

      // الخطوة 2: إنشاء الدفع
      alert("🔵 الخطوة 2: جاري إنشاء الدفع...");

      const paymentData = {
        amount: product.price * quantity,
        memo: `شراء: ${product.name} (${quantity}x)`,
        metadata: {
          productId: product.id,
          quantity,
          userId
        }
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          alert("🔵 الخطوة 3: جاري الموافقة على الدفع...");
          
          try {
            const response = await fetch("/api/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({
                paymentId,
                productId: product.id,
                quantity
              })
            });

            const data = await response.json();

            if (!response.ok) {
              alert("❌ فشلت الموافقة: " + data.error);
              throw new Error(data.error);
            }

            alert("✅ تمت الموافقة على الدفع!");
          } catch (err: any) {
            alert("❌ خطأ في الموافقة: " + err.message);
            throw err;
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          alert("🔵 الخطوة 4: جاري إكمال الدفع...");
          
          try {
            const response = await fetch("/api/payments/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
              },
              body: JSON.stringify({ paymentId, txid })
            });

            const data = await response.json();

            if (!response.ok) {
              alert("❌ فشل الإكمال: " + data.error);
              throw new Error(data.error);
            }

            alert("🎉 تم الدفع بنجاح!");
          } catch (err: any) {
            alert("❌ خطأ في الإكمال: " + err.message);
            throw err;
          }
        },

        onCancel: (paymentId: string) => {
          alert("⚠️ تم إلغاء الدفع من قبل المستخدم");
          setError("Payment cancelled by user");
        },

        onError: (error: Error, payment: any) => {
          alert("❌ خطأ في الدفع: " + error.message);
          setError(error.message);
        }
      };

      await window.Pi.createPayment(paymentData, callbacks);

    } catch (err: any) {
      alert("❌ خطأ عام: " + err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isPiBrowser) {
    return (
      <div style={{
        padding: "20px",
        backgroundColor: "#fff3cd",
        border: "1px solid #ffc107",
        borderRadius: "8px",
        margin: "10px 0",
        textAlign: "center"
      }}>
        ⚠️ <strong>تنبيه:</strong> يرجى فتح هذا التطبيق من <strong>Pi Browser</strong>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        style={{
          padding: "15px 30px",
          backgroundColor: loading ? "#ccc" : "#8b5cf6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontSize: "18px",
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          transition: "background-color 0.2s"
        }}
      >
        {loading ? "⏳ جاري المعالجة..." : `💎 ادفع ${product.price * quantity} Pi`}
      </button>

      {error && (
        <div style={{
          marginTop: "10px",
          padding: "12px",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "8px",
          color: "#721c24",
          textAlign: "center"
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}
