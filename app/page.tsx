"use client"

import { useState } from "react"

declare global {
  interface Window {
    Pi: any
  }
}

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const product = {
    id: 1,
    name: "منتج تجريبي",
    description: "اختبار الدفع بـ Pi",
    price: 0.1,
    image:
      "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0",
  }

  const payWithPi = async () => {
    try {
      setLoading(true)
      setMessage("جاري فتح الدفع...")

      if (!window.Pi) {
        alert("افتح التطبيق داخل Pi Browser")
        return
      }

      const scopes = ["payments"]

      await window.Pi.init({ version: "2.0", sandbox: true })

      const paymentData = {
        amount: product.price,
        memo: product.description,
        metadata: {
          productId: product.id,
          productName: product.name,
        },
      }

      window.Pi.createPayment(
        paymentData,
        {
          onReadyForServerApproval: async (paymentId: string) => {
            console.log("Ready:", paymentId)

            await fetch(
              "https://YOUR_SUPABASE_URL/functions/v1/approve-payment",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ paymentId }),
              }
            )
          },

          onReadyForServerCompletion: async (
            paymentId: string,
            txid: string
          ) => {
            console.log("Complete:", paymentId)

            await fetch(
              "https://YOUR_SUPABASE_URL/functions/v1/complete-payment",
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
            )

            setMessage("تم الدفع بنجاح ✅")
          },

          onCancel: function () {
            setMessage("تم إلغاء الدفع")
          },

          onError: function (error: any) {
            console.error(error)
            setMessage("حدث خطأ أثناء الدفع")
          },
        }
      )
    } catch (err) {
      console.error(err)
      setMessage("فشل الاتصال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-gray-100 rounded-2xl shadow-lg p-5">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover rounded-xl"
        />

        <h1 className="text-2xl font-bold mt-4">{product.name}</h1>

        <p className="text-gray-600 mt-2">{product.description}</p>

        <div className="mt-4 text-3xl font-bold text-purple-700">
          {product.price} Pi
        </div>

        <button
          onClick={payWithPi}
          disabled={loading}
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold"
        >
          {loading ? "جاري الدفع..." : "ادفع الآن"}
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
