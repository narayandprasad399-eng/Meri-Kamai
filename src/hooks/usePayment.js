import { useState } from 'react'

const WORKER_URL = import.meta.env.VITE_CF_WORKER_URL

// Razorpay script load karo
const loadRazorpay = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true)
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => resolve(true)
  s.onerror = () => resolve(false)
  document.body.appendChild(s)
})

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const initiatePayment = async ({ productId, userId, userEmail, userName, onSuccess, onFailure }) => {
    setLoading(true)
    setError(null)

    try {
      // ── Guard: Worker URL set hai? ──────────────
      if (!WORKER_URL) {
        throw new Error('Worker URL set nahi hai. .env mein VITE_CF_WORKER_URL daalo.')
      }

      // ── Guard: User logged in hai? ──────────────
      if (!userId) {
        throw new Error('Payment ke liye pehle sign in karo.')
      }

      // ── Razorpay script load ────────────────────
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay load nahi hua. Internet check karo.')

      // ── Worker se order create ──────────────────
      let orderData
      try {
        const orderRes = await fetch(`${WORKER_URL}/payment/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, userId, userEmail }),
        })
        orderData = await orderRes.json()
        if (!orderRes.ok) throw new Error(orderData.error || 'Order create failed')
      } catch (fetchErr) {
        throw new Error(`Server se connect nahi hua: ${fetchErr.message}`)
      }

      // ── Razorpay checkout open ──────────────────
      const rzp = new window.Razorpay({
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Meri Kamai',
        description: orderData.product?.description || productId,
        image: '/icon-192.png',
        order_id: orderData.orderId,
        prefill: { name: userName || '', email: userEmail || '' },
        theme: { color: '#ff6b00' },
        modal: {
          ondismiss: () => {
            setLoading(false)
            onFailure?.('Payment cancel hua')
          }
        },
        handler: async (response) => {
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
      })

      rzp.on('payment.failed', (response) => {
        const msg = response.error?.description || 'Payment failed'
        setError(msg)
        setLoading(false)
        onFailure?.(msg)
      })

      rzp.open()

    } catch (err) {
      setError(err.message)
      setLoading(false)
      onFailure?.(err.message)
      console.error('Payment error:', err)
    }
  }

  return { initiatePayment, loading, error }
}
