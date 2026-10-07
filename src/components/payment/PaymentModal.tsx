
import React, { useState } from 'react';
import { GeminiIcon } from '@/components/atoms/GeminiIcon';
import { StudentProfile } from '@/lib/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onPaymentSuccess: (updatedProfile: Partial<StudentProfile>) => void;
  defaultPlan?: 'monthly' | 'semester' | 'wallet';
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  profile,
  onPaymentSuccess,
  defaultPlan = 'monthly',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'semester' | 'wallet'>(defaultPlan);
  const [emailInput, setEmailInput] = useState(
    profile.email && profile.email.includes('@') && !profile.email.endsWith('@student.cohart.ng')
      ? profile.email
      : ''
  );
  const [walletAmount, setWalletAmount] = useState('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const plans = [
    {
      id: 'monthly' as const,
      name: 'Cohart Pro Monthly',
      price: 1500,
      priceLabel: '₦1,500',
      period: 'per month',
      popular: true,
      features: [
        'Unlimited AI Academic Tutor & Reasoning',
        'Direct Peer Audio Notes & Practice Sharing',
        'Full Exam Hall Timetable & GPS Routing',
        'Ad-free Interactive Reader & Active Recall',
      ],
    },
    {
      id: 'semester' as const,
      name: 'Semester Pass',
      price: 3500,
      priceLabel: '₦3,500',
      period: 'per semester (4 months)',
      popular: false,
      features: [
        'Everything in Monthly Pro',
        'Save over 40% per academic semester',
        'Priority Campus AI Voice Model access',
        'Verified Student Pro Scholar badge',
      ],
    },
    {
      id: 'wallet' as const,
      name: 'Top-up Student Wallet',
      price: Number(walletAmount) || 1000,
      priceLabel: 'Custom',
      period: 'instant balance',
      popular: false,
      features: [
        'Pay for printing & peer note summaries',
        'Campus marketplace & tutorial micro-transfers',
        'Withdraw or transfer anytime',
      ],
    },
  ];

  const currentPlan = plans.find((p) => p.id === selectedPlan) || plans[0];
  const payableAmount = selectedPlan === 'wallet' ? (Number(walletAmount) || 1000) : currentPlan.price;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const targetEmail = emailInput.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address for receipt & account verification.');
      return;
    }

    if (payableAmount < 500) {
      setErrorMessage('Minimum payment amount is ₦500.');
      return;
    }

    setIsProcessing(true);

    try {
      // Dynamic Paystack inline script loader if needed
      const loadScript = () =>
        new Promise<boolean>((resolve) => {
          if (typeof window !== 'undefined' && window.PaystackPop) {
            resolve(true);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

      await loadScript();

      const paystackKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        'pk_test_b8e21a8d052a23e595305f884f8280f9e34bf5eb';

      const purpose =
        selectedPlan === 'monthly'
          ? 'subscription_pro_monthly'
          : selectedPlan === 'semester'
          ? 'subscription_pro_semester'
          : 'wallet_topup';

      const transactionRef = 'ch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

      if (window.PaystackPop && typeof window.PaystackPop.setup === 'function') {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: targetEmail,
          amount: payableAmount * 100, // Paystack requires amount in Kobo
          currency: 'NGN',
          ref: transactionRef,
          metadata: {
            custom_fields: [
              {
                display_name: 'Student Name',
                variable_name: 'student_name',
                value: profile.full_name || profile.matric_number,
              },
              {
                display_name: 'Institution',
                variable_name: 'institution',
                value: profile.institution || 'Cohart Scholar',
              },
              {
                display_name: 'Purpose',
                variable_name: 'purpose',
                value: purpose,
              },
            ],
          },
          callback: async (response: { reference: string }) => {
            await finalizePayment(response.reference || transactionRef, targetEmail, payableAmount, purpose);
          },
          onClose: () => {
            setIsProcessing(false);
          },
        });
        handler.openIframe();
      } else {
        // Fallback directly to server verification endpoint (Demo/Test resilience)
        await finalizePayment(transactionRef, targetEmail, payableAmount, purpose);
      }
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setErrorMessage(err.message || 'Payment failed to initialize.');
      setIsProcessing(false);
    }
  };

  const finalizePayment = async (
    reference: string,
    email: string,
    amount: number,
    purpose: string
  ) => {
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          email,
          amount,
          purpose,
          reference,
          metadata: {
            plan: selectedPlan,
            fullName: profile.full_name,
            institution: profile.institution,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Payment confirmation failed');
      }

      setSuccessMessage(data.message || 'Payment verified! Profile upgraded.');
      if (data.profile) {
        onPaymentSuccess(data.profile);
      } else {
        // Optimistic fallback
        if (purpose === 'subscription_pro_monthly') {
          onPaymentSuccess({ subscription_tier: 'pro_monthly', email });
        } else if (purpose === 'subscription_pro_semester') {
          onPaymentSuccess({ subscription_tier: 'pro_semester', email });
        } else {
          onPaymentSuccess({
            wallet_balance: (profile.wallet_balance || 0) + amount,
            email,
          });
        }
      }

      setTimeout(() => {
        setIsProcessing(false);
        onClose();
      }, 1500);
    } catch (e: any) {
      console.error('Finalize payment error:', e);
      setErrorMessage(e.message || 'Payment verification failed.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#1E1F20] rounded-3xl border border-black/[0.08] dark:border-white/[0.1] p-6 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8] flex items-center justify-center">
              <GeminiIcon name="sparkle" size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Cohart Pro & Wallet
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Unlock full campus AI tutoring & peer resources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          >
            <GeminiIcon name="close" size={18} />
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
            {successMessage}
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400">
            {errorMessage}
          </div>
        )}

        {/* Plan Selector */}
        <div className="grid grid-cols-3 gap-2">
          {plans.map((p) => {
            const isSelected = selectedPlan === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlan(p.id)}
                className={`relative p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-[#0B57D0] dark:border-[#1A73E8] bg-[#0B57D0]/[0.05] dark:bg-[#1A73E8]/[0.1] shadow-xs'
                    : 'border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.15] dark:hover:border-white/[0.15] bg-neutral-50/50 dark:bg-white/[0.02]'
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-2 left-3 bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Best Value
                  </span>
                )}
                <div>
                  <p className="text-[11px] font-bold text-neutral-900 dark:text-white truncate">
                    {p.name.replace('Cohart ', '')}
                  </p>
                  <p className="text-xs font-extrabold text-[#0B57D0] dark:text-[#1A73E8] mt-1">
                    {p.priceLabel}
                  </p>
                </div>
                <p className="text-[9px] text-neutral-400 mt-2 truncate">
                  {p.period}
                </p>
              </button>
            );
          })}
        </div>

        {/* Plan Details Box */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {currentPlan.name}
            </span>
            <span className="text-xs font-mono font-bold text-[#0B57D0] dark:text-[#1A73E8]">
              ₦{payableAmount.toLocaleString()}
            </span>
          </div>

          {selectedPlan === 'wallet' ? (
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-mono uppercase text-neutral-500">
                Top-Up Amount (NGN)
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {['500', '1000', '2500', '5000'].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWalletAmount(amt)}
                    className={`py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      walletAmount === amt
                        ? 'border-[#0B57D0] dark:border-[#1A73E8] bg-[#0B57D0]/10 dark:bg-[#1A73E8]/15 text-[#0B57D0] dark:text-[#1A73E8]'
                        : 'border-black/[0.08] dark:border-white/[0.08] text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    ₦{amt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="space-y-1.5 pt-1">
              {currentPlan.features.map((feat, idx) => (
                <li key={idx} className="flex items-center gap-2 text-[11px] text-neutral-600 dark:text-neutral-300">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <GeminiIcon name="shield-check" size={10} />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Checkout Form */}
        <form onSubmit={handlePay} className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-neutral-500 uppercase">
                Billing Email <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-neutral-400">Required for payment receipt</span>
            </div>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              className="w-full p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.1] text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-[#0B57D0] dark:focus:border-[#1A73E8]"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 px-1">
            <span>Payment Gateway</span>
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
              <GeminiIcon name="shield-check" size={12} className="text-emerald-500" /> Paystack Secured (Card / Transfer / OPay)
            </span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 rounded-full bg-[#0B57D0] dark:bg-[#1A73E8] text-white text-xs font-bold hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-[#0B57D0]/20 dark:shadow-[#1A73E8]/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <GeminiIcon name="sparkle" size={14} className="animate-spin text-white" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <span>Pay ₦{payableAmount.toLocaleString()}</span>
                <GeminiIcon name="chevron-right" size={14} className="text-white" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};