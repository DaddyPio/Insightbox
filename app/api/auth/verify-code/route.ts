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
    const { data: codeData, error: findError } = await supabaseAdmin
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
    await supabaseAdmin
      .from('verification_codes')
      .update({ used: true })
      .eq('id', codeData.id);

    // Get or create user in Supabase Auth
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(
      email.toLowerCase().trim()
    );

    let userId: string;

    if (existingUser?.user) {
      // User exists
      userId = existingUser.user.id;
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase().trim(),
        email_confirm: true, // Auto-confirm email since we verified it
      });

      if (createError) {
        throw createError;
      }

      userId = newUser.user.id;
    }

    // Generate a magic link that will auto-sign in the user
    // We'll use this to create a session
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase().trim(),
    });

    if (linkError) {
      throw linkError;
    }

    // Extract the token from the link
    const url = new URL(linkData.properties.action_link);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');

    return NextResponse.json({
      success: true,
      userId,
      email: email.toLowerCase().trim(),
      token,
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

