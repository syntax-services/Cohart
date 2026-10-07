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
    const { action, username, password, fullName, institution, realEmail } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    const cleanUser = username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (cleanUser.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 alphanumeric characters.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const internalEmail = realEmail && realEmail.includes('@')
      ? realEmail.trim().toLowerCase()
      : `${cleanUser}@student.cohart.ng`;

    if (action === 'signup') {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: internalEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          username: cleanUser,
          full_name: fullName || cleanUser,
          institution: institution || 'OOU',
          has_real_email: Boolean(realEmail && realEmail.includes('@')),
        },
      });

      if (createError) {
        if (createError.message.toLowerCase().includes('already registered')) {
          return NextResponse.json(
            { error: 'Username already taken. Please choose another username or log in.' },
            { status: 409 }
          );
        }
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      if (newUser.user) {
        await supabaseAdmin.from('profiles').upsert({
          id: newUser.user.id,
          full_name: fullName || cleanUser,
          institution: institution || 'OOU',
          email: realEmail || '',
          matric_number: cleanUser,
        });
      }

      return NextResponse.json({
        success: true,
        internalEmail,
        userId: newUser.user?.id,
        username: cleanUser,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
