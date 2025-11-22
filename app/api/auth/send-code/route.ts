import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/types';
import crypto from 'crypto';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = crypto.randomInt(100000, 999999).toString();

    // Store code in database (expires in 10 minutes)
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const insertData = {
      email: email.toLowerCase().trim(),
      code,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    };

    const { error: dbError } = await (supabaseAdmin as any)
      .from('verification_codes')
      .insert(insertData);

    if (dbError) {
      console.error('Error storing verification code:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send email with verification code using Resend
    let emailSent = false;
    let emailError: any = null;

    // Log configuration status
    console.log('🔍 Resend Configuration Check:');
    console.log('  - resend instance exists:', !!resend);
    console.log('  - RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
    console.log('  - RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    console.log('  - RESEND_FROM_EMAIL exists:', !!process.env.RESEND_FROM_EMAIL);
    console.log('  - RESEND_FROM_EMAIL value:', process.env.RESEND_FROM_EMAIL || 'NOT SET');

    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        const toEmail = email.toLowerCase().trim();
        const fromEmail = process.env.RESEND_FROM_EMAIL;
        
        console.log('📧 Attempting to send email via Resend:');
        console.log('  - From:', fromEmail);
        console.log('  - To:', toEmail);
        console.log('  - Code:', code);
        
        const emailPayload = {
          from: fromEmail,
          to: toEmail,
          subject: 'InsightBox 驗證碼 / Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #8B6F47;">InsightBox 驗證碼</h2>
              <p>您的驗證碼是：</p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B6F47; border-radius: 8px; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px;">此驗證碼將在 10 分鐘後過期。</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <h2 style="color: #8B6F47;">InsightBox Verification Code</h2>
              <p>Your verification code is:</p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #8B6F47; border-radius: 8px; margin: 20px 0;">
                ${code}
              </div>
              <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
            </div>
          `,
          text: `InsightBox 驗證碼 / Verification Code: ${code}\n\n此驗證碼將在 10 分鐘後過期 / This code will expire in 10 minutes.`,
        };
        
        console.log('📧 Calling resend.emails.send()...');
        const result = await resend.emails.send(emailPayload);
        console.log('📧 Resend API call completed');
        console.log('📧 Result:', JSON.stringify(result, null, 2));

        if (result.error) {
          emailError = result.error;
          console.error('❌ Error in Resend response:', JSON.stringify(result.error, null, 2));
        } else {
          emailSent = true;
          console.log('✅ Verification code email sent successfully via Resend');
          console.log('✅ Email ID:', result.data?.id);
        }
      } catch (emailErr: any) {
        emailError = emailErr;
        console.error('❌ Exception caught while sending email:');
        console.error('  - Error type:', emailErr?.constructor?.name);
        console.error('  - Error message:', emailErr?.message);
        console.error('  - Error stack:', emailErr?.stack);
        console.error('  - Full error:', JSON.stringify(emailErr, Object.getOwnPropertyNames(emailErr), 2));
      }
    } else {
      // No Resend configured
      console.warn('⚠️ Resend not configured or missing environment variables:');
      console.warn('  - resend instance:', !!resend);
      console.warn('  - RESEND_API_KEY:', !!process.env.RESEND_API_KEY);
      console.warn('  - RESEND_FROM_EMAIL:', !!process.env.RESEND_FROM_EMAIL);
    }

    // Log code for debugging (in all environments for now)
    console.log('🔐 Verification code generated:', code);

    // Return response with error details if email failed
    if (!emailSent && resend && process.env.RESEND_FROM_EMAIL) {
      return NextResponse.json({
        success: false,
        message: 'Failed to send verification code email',
        error: emailError?.message || 'Unknown email error',
        details: emailError,
        // Include code in response for debugging (remove in production)
        code: code,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Verification code sent' : 'Verification code generated (email not configured)',
      // Include code in response for debugging (remove in production)
      code: code,
    });
  } catch (error: any) {
    console.error('Error in send-code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

