import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid email or code' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Find and verify the code
    const { data: codeData, error: findError } = await (supabaseAdmin as any)
      .from('verification_codes')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (findError || !codeData) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Mark code as used
    await (supabaseAdmin as any)
      .from('verification_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    // Get or create user in Supabase Auth
    // Use listUsers to find existing user by email
    const normalizedEmail = email.toLowerCase().trim();
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    let userId: string;
    const existingUser = usersList?.users?.find(u => u.email === normalizedEmail);

    if (existingUser) {
      // User exists
      userId = existingUser.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true, // Auto-confirm email since we verified it
      });

      if (createError) {
        throw createError;
      }

      userId = newUser.user.id;
    }

    // Create a session directly using admin API
    // Generate a session token for the user
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (sessionError) {
      console.error('Error generating session link:', sessionError);
      throw sessionError;
    }

    // Extract token and hashed_token from the link
    const url = new URL(sessionData.properties.action_link);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type') || 'magiclink';
    const hashedToken = url.searchParams.get('token_hash');

    // Create a session using the token
    // We need to exchange the token for a session
    const { data: exchangeData, error: exchangeError } = await supabaseAdmin.auth.verifyOtp({
      type: 'magiclink',
      token_hash: hashedToken || token || '',
      email: normalizedEmail,
    });

    if (exchangeError || !exchangeData.session) {
      console.error('Error exchanging token for session:', exchangeError);
      // Fallback: return token and let frontend handle it
      return NextResponse.json({
        success: true,
        userId,
        email: normalizedEmail,
        token,
        type,
        hashedToken,
      });
    }

    // Return session tokens
    return NextResponse.json({
      success: true,
      userId,
      email: normalizedEmail,
      accessToken: exchangeData.session.access_token,
      refreshToken: exchangeData.session.refresh_token,
      token, // Keep for backward compatibility
      type,
    });
  } catch (error: any) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

