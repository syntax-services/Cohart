import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fnqnxdmdyevzavsbfelv.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZucW54ZG1keWV2emF2c2JmZWx2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTkxMjc0NSwiZXhwIjoyMTA1NDg4NzQ1fQ.n17m1XxEqmAOL3Jy2rKYfrxyVEhzxRVvZuG0fs6Gae0';

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, email, amount, purpose, reference, metadata } = body;

    if (!userId || !email || !amount || !purpose) {
      return NextResponse.json(
        { error: 'Missing required payment details (userId, email, amount, purpose).' },
        { status: 400 }
      );
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required for payment processing & receipts.' },
        { status: 400 }
      );
    }

    const payRef = reference || ('ch_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
    const parsedAmount = Number(amount);

    // 1. Record payment in payments table
    const { error: paymentError } = await supabaseAdmin.from('payments').insert([
      {
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        user_id: userId,
        email: email.trim().toLowerCase(),
        amount: parsedAmount,
        currency: 'NGN',
        purpose,
        reference: payRef,
        status: 'success',
        channel: 'paystack',
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      },
    ]);

    if (paymentError) {
      console.error('Payment record error:', paymentError);
    }

    // 2. Fetch current profile
    const { data: currentProfile } = await supabaseAdmin
      .from('profiles')
      .select('wallet_balance, subscription_tier, email')
      .eq('id', userId)
      .maybeSingle();

    const currentBalance = Number(currentProfile?.wallet_balance || 0);
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Always update email if user did not have one before
    if (!currentProfile?.email) {
      updatePayload.email = email.trim().toLowerCase();
    }

    // Handle Pro Subscriptions or Wallet Top-up
    if (purpose === 'subscription_pro_monthly') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      updatePayload.subscription_tier = 'pro_monthly';
      updatePayload.subscription_expires_at = expires.toISOString();
    } else if (purpose === 'subscription_pro_semester') {
      const expires = new Date();
      expires.setDate(expires.getDate() + 120);
      updatePayload.subscription_tier = 'pro_semester';
      updatePayload.subscription_expires_at = expires.toISOString();
    } else if (purpose === 'wallet_topup') {
      updatePayload.wallet_balance = currentBalance + parsedAmount;
    }

    const { data: updatedProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update failed:', profileError);
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reference: payRef,
      profile: updatedProfile,
      message: purpose.startsWith('subscription')
        ? 'Subscription activated successfully!'
        : 'Wallet balance topped up successfully!',
    });
  } catch (err: any) {
    console.error('Payment API unexpected error:', err);
    return NextResponse.json({ error: err.message || 'Payment processing error' }, { status: 500 });
  }
}
