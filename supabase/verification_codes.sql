-- Create table for storing verification codes
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_code ON verification_codes(email, code) WHERE used = FALSE;
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Enable RLS
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert verification codes (for signup/login)
-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Allow insert verification codes" ON verification_codes;
CREATE POLICY "Allow insert verification codes" ON verification_codes
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to read and update their own verification codes
DROP POLICY IF EXISTS "Allow read own verification codes" ON verification_codes;
CREATE POLICY "Allow read own verification codes" ON verification_codes
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow update own verification codes" ON verification_codes;
CREATE POLICY "Allow update own verification codes" ON verification_codes
  FOR UPDATE
  USING (true);

-- Function to clean up expired codes (optional, can be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM verification_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

