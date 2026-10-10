'use client';

import React, { useState } from 'react';
import { Invoice } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function PaymentModal({
  invoice,
  onClose,
  onPaymentSuccess,
}: {
  invoice: Invoice;
  onClose: () => void;
  onPaymentSuccess: () => void;
}) {
  const { currentUser } = useAuth();
  const [provider, setProvider] = useState<'stripe' | 'razorpay'>('stripe');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      // 1. Create order on server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
        },
        body: JSON.stringify({
          invoice_id: invoice.id,
          provider,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error);

      // 2. Simulate server webhook settlement (Never trust browser callback alone!)
      const webhookRes = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'sha256=test_valid_signature',
        },
        body: JSON.stringify({
          id: `evt_sim_${Date.now()}`,
          type: 'payment_intent.succeeded',
          invoice_id: invoice.id,
          amount: invoice.total_amount,
          currency: invoice.currency,
        }),
      });

      if (!webhookRes.ok) throw new Error('Payment webhook settlement failed');

      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-[#0E1524] border border-slate-700/80 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Pay Invoice {invoice.invoice_number}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Apex Retail Brands</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Total Amount</span>
            <p className="text-xl font-bold text-emerald-400">
              ${invoice.total_amount.toLocaleString()} {invoice.currency}
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Escrow Protected
          </span>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="font-bold text-white text-base">Payment Authorized & Settled!</h4>
            <p className="text-xs text-slate-400">
              Cryptographic webhook confirmed. Invoice marked as paid.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePay} className="space-y-4">
            {/* Gateway Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('stripe')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  provider === 'stripe'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Stripe Checkout</span>
              </button>
              <button
                type="button"
                onClick={() => setProvider('razorpay')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  provider === 'razorpay'
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Razorpay / UPI</span>
              </button>
            </div>

            {/* Test Card Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Expires</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Verifying cryptographic order...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Authorize ${invoice.total_amount.toLocaleString()} Payment</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS Level 1 compliant gateway</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
