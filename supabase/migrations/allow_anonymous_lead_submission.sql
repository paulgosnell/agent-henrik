-- Allow anonymous users to submit leads and booking inquiries
-- This is needed for contact forms and newsletter signups

-- Drop existing service role only policy
DROP POLICY IF EXISTS "Service role can insert leads" ON leads;

-- Drop existing service role only policy for booking inquiries
DROP POLICY IF EXISTS "Service role can insert inquiries" ON booking_inquiries;

-- Create new policy allowing both anonymous and service role to insert leads
CREATE POLICY "Anonymous and service role can insert leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Create new policy allowing both anonymous and service role to insert booking inquiries
CREATE POLICY "Anonymous and service role can insert inquiries"
  ON booking_inquiries FOR INSERT
  WITH CHECK (true);

-- Note: Read, update, and delete policies remain authenticated only for security
