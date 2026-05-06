"use client"

import { useEffect, useState } from "react"

declare global {
  interface Window {
    Pi: any
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined" && window.Pi) {
      window.Pi.init({
        version: "2.0",
        sandbox: true,
      })
    }
  }, [])

  const onIncompletePaymentFound = async (payment: any) => {
    console.log("Incomplete payment found:", payment)
  }

  const loginWithPi = async () => {
    try {
      if (!window.Pi) {
        alert("افتح التطبيق داخل Pi Browser")
        return
      }

      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        onIncompletePaymentFound
      )

      setUser(auth.user)
      setMessage("تم تسجيل الدخول بنجاح")
    } catch (error) {
      console.error(error)
      alert("فشل تسجيل الدخول")
    }
  }

  const payWithPi = async () => {
    try {
      if (!user) {
        alert("سجل الدخول أولاً")
        return
      }

      setLoading(true)
      setMessage("جاري فتح الدفع...")

      const paymentData = {
        amount: 0.1,
        memo: "اختبار الدفع",
        metadata: {
          productId: "test-product",
          productName: "منتج تجريبي",
          username: user.username,
        },
      }

      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          setMessage("جاري تأكيد الدفع...")

          const res = await fetch("/api/approve-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId }),
          })

          const data = await res.json()
          console.log("Approve response:", data)

          if (!res.ok) {
            throw new Error("فشل approve-payment")
          }
        },

        onReadyForServerCompletion: async (
          paymentId: string,
          txid: string
        ) => {
          setMessage("جاري إكمال الدفع...")

          const res = await fetch("/api/complete-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ paymentId, txid }),
          })

          const data = await res.json()
          console.log("Complete response:", data)

          if (!res.ok) {
            throw new Error("فشل complete-payment")
          }

          setMessage("تم الدفع بنجاح ✅")
          alert("تم الدفع بنجاح ✅")
        },

        onCancel: (paymentId: string) => {
          console.log("Payment cancelled:", paymentId)
          setMessage("تم إلغاء الدفع")
          setLoading(false)
        },

        onError: (error: any, payment: any) => {
          console.error("Payment error:", error)
          console.log("Payment object:", payment)
          setMessage("خطأ في الدفع")
          setLoading(false)
          alert("فشل الدفع")
        },
      })
    } catch (error) {
      console.error(error)
      setMessage("حدث خطأ أثناء الدفع")
      setLoading(false)
      alert("حدث خطأ أثناء الدفع")
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f5f2ef] flex items-center justify-center p-6"
    >
      <div className="bg-white rounded-3xl shadow-xl p-5 max-w-sm w-full">
        <img
          src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=1200&auto=format&fit=crop"
          alt="منتج تجريبي"
          className="w-full h-80 object-cover rounded-2xl"
        />

        <h1 className="text-4xl font-bold text-right mt-5">
          منتج تجريبي
        </h1>

        <p className="text-gray-600 text-right mt-2 text-xl">
          اختبار الدفع بـ Pi
        </p>

        <div className="text-center text-purple-700 text-6xl font-bold mt-6">
          Pi 0.1
        </div>

        {!user ? (
          <button
            onClick={loginWithPi}
            className="w-full mt-8 bg-purple-700 text-white py-4 rounded-2xl text-2xl font-bold"
          >
            تسجيل الدخول بـ Pi
          </button>
        ) : (
          <button
            onClick={payWithPi}
            disabled={loading}
            className="w-full mt-8 bg-purple-700 text-white py-4 rounded-2xl text-2xl font-bold disabled:opacity-60"
          >
            {loading ? "جاري فتح الدفع..." : "ادفع الآن"}
          </button>
        )}

        {user && (
          <p className="mt-4 text-center text-green-700 font-bold">
            @{user.username}
          </p>
        )}

        {message && (
          <p className="mt-4 text-center text-gray-700">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
