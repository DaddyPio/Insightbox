import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
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

    const { error: dbError } = await supabaseAdmin
      .from('verification_codes')
      .insert({
        email: email.toLowerCase().trim(),
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      });

    if (dbError) {
      console.error('Error storing verification code:', dbError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Send email with verification code using Resend
    if (resend && process.env.RESEND_FROM_EMAIL) {
      try {
        const { error: emailError } = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: email.toLowerCase().trim(),
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
        });

        if (emailError) {
          console.error('Error sending email via Resend:', emailError);
          // Fallback to console log in development
          if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Verification code (dev only):', code);
          }
        }
      } catch (emailErr) {
        console.error('Error sending email:', emailErr);
        // Continue even if email fails - code is stored in DB
      }
    } else {
      // No Resend configured, log code in development
      if (process.env.NODE_ENV === 'development') {
        console.log('🔐 Verification code (dev only - Resend not configured):', code);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // In development, return code for testing if Resend is not configured
      ...(process.env.NODE_ENV === 'development' && !resend && { code }),
    });
  } catch (error: any) {
    console.error('Error in send-code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

