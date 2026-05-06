'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  name: string
  description: string
  price: number
  image: string
}

type CartItem = Product & {
  quantity: number
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error(error)
      return
    }

    setProducts(data || [])
  }

  function addToCart(product: Product) {
    setCartItems((items) => {
      const existing = items.find((item) => item.id === product.id)

      if (existing) {
        return items.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [...items, { ...product, quantity: 1 }]
    })

    setShowCart(true)
  }

  function increaseQuantity(id: number) {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    )
  }

  function decreaseQuantity(id: number) {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  function removeItem(id: number) {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  async function handlePiPayment() {
    try {
      if (!customerName || !customerPhone || !customerAddress) {
        alert('أدخل الاسم والهاتف والعنوان')
        return
      }

      if (cartItems.length === 0) {
        alert('السلة فارغة')
        return
      }

      if (typeof window === 'undefined' || !(window as any).Pi) {
        alert('افتح التطبيق داخل Pi Browser')
        return
      }

      const Pi = (window as any).Pi

      Pi.init({
        version: '2.0',
        sandbox: true
      })

      await Pi.createPayment(
        {
          amount: totalPrice,
          memo: 'Bijoux Fati Order',
          metadata: {
            customerName,
            customerPhone,
            customerAddress,
            items: cartItems
          }
        },
        {
          onReadyForServerApproval: async function (paymentId: string) {
            await fetch(
              'https://jatizfpvxvxlnzonljew.supabase.co/functions/v1/approve-payment',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ paymentId })
              }
            )
          },

          onReadyForServerCompletion: async function (
            paymentId: string,
            txid: string
          ) {
            await fetch(
              'https://jatizfpvxvxlnzonljew.supabase.co/functions/v1/complete-payment',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  paymentId,
                  txid
                })
              }
            )

            await supabase.from('orders').insert([
              {
                customer_name: customerName,
                customer_phone: customerPhone,
                customer_address: customerAddress,
                items: cartItems,
                total: totalPrice,
                status: 'paid',
                payment_id: paymentId,
                txid: txid
              }
            ])

            alert('تم الدفع بنجاح')
            setCartItems([])
            setShowCart(false)
          },

          onCancel: function () {
            alert('تم إلغاء الدفع')
          },

          onError: function (error: any) {
            console.error(error)
            alert('حدث خطأ في الدفع')
          }
        }
      )
    } catch (error) {
      console.error(error)
      alert('حدث خطأ')
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f2ea] p-4 text-right" dir="rtl">
      <header className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setShowCart(true)}
          className="rounded-xl bg-white px-4 py-2 shadow"
        >
          السلة ({cartItems.length})
        </button>

        <div>
          <h1 className="text-3xl font-bold text-[#a95700]">Bijoux Fati</h1>
          <p className="text-gray-600">المجوهرات الفاخرة على Pi Network</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-2xl bg-white p-3 shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="h-40 w-full rounded-xl object-cover"
            />

            <h2 className="mt-3 font-bold">{product.name}</h2>

            <p className="mt-1 text-sm text-gray-600">
              {product.description}
            </p>

            <p className="mt-2 font-bold text-[#a95700]">
              Pi {product.price}
            </p>

            <button
              onClick={() => addToCart(product)}
              className="mt-3 w-full rounded-xl bg-[#a95700] py-2 text-white"
            >
              أضف للسلة
            </button>
          </div>
        ))}
      </section>

      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40">
          <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={() => setShowCart(false)}
                className="rounded-xl border px-4 py-2"
              >
                إغلاق
              </button>

              <h2 className="text-2xl font-bold">السلة</h2>
            </div>

            {cartItems.map((item) => (
              <div
                key={item.id}
                className="mb-3 flex items-center gap-3 rounded-2xl border p-3"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="font-bold text-[#a95700]">
                    Pi {item.price}
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="rounded-lg border px-3 py-1"
                    >
                      +
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="rounded-lg border px-3 py-1"
                    >
                      -
                    </button>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="my-4 flex justify-between border-t pt-4 text-xl font-bold">
              <span>المجموع</span>
              <span>Pi {totalPrice}</span>
            </div>

            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="الاسم الكامل"
              className="mb-3 w-full rounded-xl border p-3 text-right"
            />

            <input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="رقم الهاتف"
              className="mb-3 w-full rounded-xl border p-3 text-right"
            />

            <textarea
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="العنوان"
              className="mb-3 w-full rounded-xl border p-3 text-right"
            />

            <button
              onClick={handlePiPayment}
              className="w-full rounded-xl bg-[#a95700] py-4 font-bold text-white"
            >
              الدفع بـ Pi
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
