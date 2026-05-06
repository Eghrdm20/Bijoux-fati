"use client"

import { useState } from "react"

declare global {
  interface Window {
    Pi: any
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState("")

  const loginWithPi = async () => {
    try {
      if (!window.Pi) {
        alert("افتح التطبيق داخل Pi Browser")
        return
      }

      window.Pi.init({
        version: "2.0",
        sandbox: true,
      })

      const auth = await window.Pi.authenticate(
        ["username", "payments"],
        function (payment: any) {
          console.log("Incomplete payment", payment)
        }
      )

      setUser(auth.user)
      setMessage("تم تسجيل الدخول: @" + auth.user.username)
    } catch (error) {
      console.log(error)
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
          productId: 1,
          username: user.username,
        },
      }

      window.Pi.createPayment(paymentData, {
        onReadyForServerApproval: async (paymentId: string) => {
          await fetch(
            "https://jatizfpvxvxlnzonljew.supabase.co/functions/v1/approve-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            }
          )
        },

        onReadyForServerCompletion: async (
          paymentId: string,
          txid: string
        ) => {
          await fetch(
            "https://jatizfpvxvxlnzonljew.supabase.co/functions/v1/complete-payment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            }
          )

          setMessage("تم الدفع بنجاح ✅")
          alert("تم الدفع بنجاح ✅")
        },

        onCancel: () => {
          setMessage("تم إلغاء الدفع")
        },

        onError: (error: any) => {
          console.log(error)
          setMessage("خطأ في الدفع")
        },
      })
    } catch (error) {
      console.log(error)
      setMessage("فشل الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f2ef] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-xl p-5 max-w-sm w-full">
        <img
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0"
          alt="منتج"
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
            className="w-full mt-8 bg-purple-600 text-white py-4 rounded-2xl text-2xl font-bold"
          >
            تسجيل الدخول بـ Pi
          </button>
        ) : (
          <button
            onClick={payWithPi}
            disabled={loading}
            className="w-full mt-8 bg-purple-600 text-white py-4 rounded-2xl text-2xl font-bold"
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
