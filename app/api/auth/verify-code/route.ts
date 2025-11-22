import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    console.log('🔐 Verify-code API called:', {
      email: email,
      codeLength: code?.length,
      timestamp: new Date().toISOString(),
    });

    // Validate input
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string' || code.length !== 6 || !/^\d{6}$/.test(code)) {
      console.error('❌ Invalid code format:', code);
      return NextResponse.json(
        { error: 'Invalid code format. Code must be 6 digits.' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      console.error('❌ Supabase admin client not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedCode = code.trim();
    
    // Use database NOW() for accurate time comparison (avoids timezone issues)
    // First, get all matching codes for debugging
    const { data: allCodes, error: listError } = await (supabaseAdmin as any)
      .from('verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', normalizedCode)
      .order('created_at', { ascending: false });
    
    console.log('🔍 All matching codes found:', allCodes?.length || 0);
    if (listError) {
      console.error('❌ Error fetching codes:', listError);
    }
    
    if (allCodes && allCodes.length > 0) {
      const now = new Date().toISOString();
      allCodes.forEach((c: any, i: number) => {
        const expiresAt = new Date(c.expires_at);
        const isExpired = expiresAt < new Date(now);
        console.log(`  Code ${i + 1}:`, {
          id: c.id,
          used: c.used,
          expires_at: c.expires_at,
          created_at: c.created_at,
          isExpired: isExpired,
          isUsed: c.used,
          timeUntilExpiry: isExpired ? 'EXPIRED' : `${Math.round((expiresAt.getTime() - new Date(now).getTime()) / 1000 / 60)} minutes`,
        });
      });
    } else {
      console.warn('⚠️ No codes found for email:', normalizedEmail);
    }

    // Find the valid code using database NOW() for accurate comparison
    // This ensures we use the database server's time, avoiding timezone issues
    const { data: codeData, error: findError } = await (supabaseAdmin as any)
      .rpc('verify_verification_code', {
        p_email: normalizedEmail,
        p_code: normalizedCode,
      })
      .single();

    // If RPC function doesn't exist, fall back to manual query
    let validCodeData = codeData;
    if (findError && findError.code === '42883') {
      // Function doesn't exist, use manual query
      console.log('⚠️ RPC function not found, using manual query');
      const now = new Date().toISOString();
      const { data: manualCodeData, error: manualFindError } = await (supabaseAdmin as any)
        .from('verification_codes')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('code', normalizedCode)
        .eq('used', false)
        .gt('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (manualFindError && manualFindError.code !== 'PGRST116') {
        console.error('❌ Manual query error:', manualFindError);
      }
      validCodeData = manualCodeData;
    } else if (findError) {
      console.error('❌ RPC query error:', findError);
    }

    console.log('🔍 Verification result:', {
      found: !!validCodeData,
      error: findError,
      codeData: validCodeData ? {
        id: validCodeData.id,
        expires_at: validCodeData.expires_at,
        created_at: validCodeData.created_at,
        used: validCodeData.used,
      } : null,
    });

    if (!validCodeData) {
      // Provide detailed error message
      const latestCode = allCodes?.[0];
      let errorMessage = 'Invalid or expired verification code';
      
      if (latestCode) {
        if (latestCode.used) {
          errorMessage = 'This verification code has already been used. Please request a new code.';
        } else {
          const expiresAt = new Date(latestCode.expires_at);
          const now = new Date();
          if (expiresAt < now) {
            const minutesExpired = Math.round((now.getTime() - expiresAt.getTime()) / 1000 / 60);
            errorMessage = `This verification code expired ${minutesExpired} minute(s) ago. Please request a new code.`;
          } else {
            errorMessage = 'Verification code not found. Please check the code and try again.';
          }
        }
      } else {
        errorMessage = 'No verification code found for this email. Please request a new code.';
      }
      
      console.error('❌ Code verification failed:', {
        findError,
        hasCodeData: !!validCodeData,
        allCodesCount: allCodes?.length || 0,
        errorMessage,
      });
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Mark code as used (with error handling)
    const { error: updateError } = await (supabaseAdmin as any)
      .from('verification_codes')
      .update({ used: true })
      .eq('id', validCodeData.id);

    if (updateError) {
      console.error('❌ Error marking code as used:', updateError);
      // Don't fail the request, but log the error
    } else {
      console.log('✅ Code marked as used:', validCodeData.id);
    }

    // Get or create user in Supabase Auth
    console.log('👤 Getting or creating user for email:', normalizedEmail);
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError);
      throw new Error('Failed to check user existence: ' + listError.message);
    }
    
    let userId: string;
    const existingUser = usersList?.users?.find(u => u.email === normalizedEmail);

    if (existingUser) {
      // User exists
      userId = existingUser.id;
      console.log('✅ Existing user found:', userId);
    } else {
      // Create new user
      console.log('➕ Creating new user for email:', normalizedEmail);
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true, // Auto-confirm email since we verified it
      });

      if (createError) {
        console.error('❌ Error creating user:', createError);
        throw new Error('Failed to create user: ' + createError.message);
      }

      userId = newUser.user.id;
      console.log('✅ New user created:', userId);
    }

    // Generate a magic link and return it for frontend to redirect
    // This is more reliable than trying to verify the token on the server side
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    console.log('🔑 Generating magic link for user:', normalizedEmail);
    console.log('🔑 Redirect URL:', `${siteUrl}/auth/callback`);
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: normalizedEmail,
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    });

    if (linkError) {
      console.error('❌ Error generating link:', linkError);
      throw new Error('Failed to generate magic link: ' + linkError.message);
    }

    if (!linkData?.properties?.action_link) {
      console.error('❌ Magic link data is missing action_link:', linkData);
      throw new Error('Magic link generation failed: no action_link in response');
    }

    console.log('✅ Magic link generated successfully');
    console.log('🔗 Magic link URL:', linkData.properties.action_link.substring(0, 100) + '...');

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
    console.error('❌ Exception in verify-code API:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    return NextResponse.json(
      { 
        error: error?.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

