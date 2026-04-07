// ================================================
// usePayment Hook
// Razorpay checkout handle karta hai
// ================================================

import { useState } from 'react'

const WORKER_URL = import.meta.env.VITE_CF_WORKER_URL

// Razorpay script load karo
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initiatePayment = async ({ productId, userId, userEmail, userName, onSuccess, onFailure }) => {
    setLoading(true)
    setError(null)

    try {
      // Razorpay script load karo
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay load nahi hua. Internet check karo.')

      // Worker se order create karo
      const orderRes = await fetch(`${WORKER_URL}/payment/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId, userEmail }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok) throw new Error(orderData.error || 'Order create failed')

      // Razorpay checkout open karo
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Meri Kamai',
        description: orderData.product.description,
        image: 'https://merikamai.in/logo.png',
        order_id: orderData.orderId,
        prefill: {
          name: userName || '',
          email: userEmail || '',
        },
        theme: { color: '#ff6b00' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            onFailure?.('Payment cancelled')
          }
        },
        handler: async (response) => {
          // Payment successful — verify karo
          try {
            const verifyRes = await fetch(`${WORKER_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userId,
                productId,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.success) {
              onSuccess?.(verifyData)
            } else {
              throw new Error(verifyData.error || 'Verification failed')
            }
          } catch (err) {
            setError(err.message)
            onFailure?.(err.message)
          } finally {
            setLoading(false)
          }
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (err) {
      setError(err.message)
      setLoading(false)
      onFailure?.(err.message)
    }
  }

  return { initiatePayment, loading, error }
}
