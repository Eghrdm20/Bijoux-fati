// components/PiPayment.tsx
'use client';

import { useEffect, useState } from 'react';

export default function PiPayment({ product, quantity }: any) {
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  useEffect(() => {
    // التحقق من أننا داخل Pi Browser
    if (typeof window !== 'undefined' && window.Pi) {
      setIsPiBrowser(true);
    }
  }, []);

  const handlePayment = async () => {
    if (!window.Pi) {
      alert('يرجى فتح هذا التطبيق من Pi Browser');
      return;
    }

    try {
      // المصادقة أولاً
      const auth = await window.Pi.authenticate(
        ['payments', 'username'],
        (payment: any) => {
          console.log('Incomplete payment:', payment);
        }
      );

      const userId = auth.user.uid;
      console.log('User authenticated:', userId);

      // إنشاء الدفع
      const paymentData = {
        amount: product.price * quantity,
        memo: `شراء: ${product.name}`,
        metadata: {
          productId: product.id,
          quantity,
          userId
        }
      };

      const callbacks = {
        onReadyForServerApproval: async (paymentId: string) => {
          console.log('Ready for approval:', paymentId);
          
          try {
            const response = await fetch('/api/payments/approve', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                paymentId,
                productId: product.id,
                quantity
              })
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Approval failed:', errorData);
              throw new Error(errorData.error || 'Approval failed');
            }

            console.log('Approval successful');
          } catch (error: any) {
            console.error('Approval error:', error);
            throw error; // مهم! لإعلام Pi SDK بالفشل
          }
        },

        onReadyForServerCompletion: async (paymentId: string, txid: string) => {
          console.log('Ready for completion:', { paymentId, txid });
          
          try {
            const response = await fetch('/api/payments/complete', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({ paymentId, txid })
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('Completion failed:', errorData);
              throw new Error(errorData.error || 'Completion failed');
            }

            console.log('Completion successful');
            alert('تم الدفع بنجاح! 🎉');
          } catch (error: any) {
            console.error('Completion error:', error);
            throw error;
          }
        },

        onCancel: (paymentId: string) => {
          console.log('Payment cancelled:', paymentId);
          alert('تم إلغاء الدفع');
        },

        onError: (error: Error, payment: any) => {
          console.error('Payment error:', error);
          alert('خطأ في الدفع: ' + error.message);
        }
      };

      await window.Pi.createPayment(paymentData, callbacks);

    } catch (error: any) {
      console.error('Payment creation failed:', error);
      alert('فشل إنشاء الدفع: ' + error.message);
    }
  };

  if (!isPiBrowser) {
    return (
      <div className="p-4 bg-yellow-100 rounded">
        ⚠️ يرجى فتح هذا التطبيق من Pi Browser
      </div>
    );
  }

  return (
    <button 
      onClick={handlePayment}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg"
    >
      ادفع {product.price * quantity} Pi
    </button>
  );
}
