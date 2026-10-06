import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const startTime = Date.now();
    // Lightweight heartbeat ping to keep Supabase PostgreSQL instance active
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.warn('Keep-alive ping warning:', error.message);
      return NextResponse.json(
        {
          status: 'warning',
          message: error.message,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startTime,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      message: 'Supabase database is ACTIVE_HEALTHY',
      profileCount: count,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown keep-alive error';
    return NextResponse.json(
      {
        status: 'error',
        error: errorMsg,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
