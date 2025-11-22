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
    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date().toISOString();
    
    console.log('🔍 Verifying code:', {
      email: normalizedEmail,
      code: code,
      currentTime: now,
    });

    // First, get all matching codes (for debugging)
    const { data: allCodes, error: listError } = await (supabaseAdmin as any)
      .from('verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .order('created_at', { ascending: false });
    
    console.log('🔍 All matching codes found:', allCodes?.length || 0);
    if (allCodes && allCodes.length > 0) {
      allCodes.forEach((c: any, i: number) => {
        console.log(`  Code ${i + 1}:`, {
          id: c.id,
          used: c.used,
          expires_at: c.expires_at,
          created_at: c.created_at,
          isExpired: c.expires_at < now,
          isUsed: c.used,
        });
      });
    }

    // Now find the valid one
    const { data: codeData, error: findError } = await (supabaseAdmin as any)
      .from('verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    console.log('🔍 Verification result:', {
      found: !!codeData,
      error: findError,
      codeData: codeData ? {
        id: codeData.id,
        expires_at: codeData.expires_at,
        created_at: codeData.created_at,
        used: codeData.used,
      } : null,
    });

    if (findError || !codeData) {
      console.error('❌ Code verification failed:', {
        findError,
        hasCodeData: !!codeData,
        allCodesCount: allCodes?.length || 0,
      });
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
    // Generate a magic link and return it for frontend to redirect
    // This is more reliable than trying to verify the token on the server side
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    console.log('🔑 Generating magic link for user:', normalizedEmail);
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (linkError) {
      console.error('❌ Error generating link:', linkError);
      throw linkError;
    }

    console.log('✅ Magic link generated successfully');

    // Return the magic link for frontend to redirect
    // This avoids token expiration issues and lets Supabase handle the verification
    return NextResponse.json({
      success: true,
      userId,
      email: normalizedEmail,
      magicLink: linkData.properties.action_link,
      redirect: true,
    });
  } catch (error: any) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

