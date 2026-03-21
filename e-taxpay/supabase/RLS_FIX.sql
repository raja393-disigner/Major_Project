-- THIS SCRIPT ADDS PERMISSION FOR THE BACKEND TO UPDATE TAX STATUS
-- Run this in your Supabase SQL Editor

-- 1. Allow the backend (or even the user) to update their own tax record to 'paid' status
-- This is necessary if the backend does not have the SERVICE_ROLE_KEY configured.
CREATE POLICY "Users can update own taxes to paid" 
    ON public.taxes FOR UPDATE 
    USING ( auth.uid() = user_id )
    WITH CHECK ( status = 'paid' );

-- 2. If the backend is acting anonymously (no user token), we can allow anon updates 
-- but ONLY if they are changing status to 'paid'. This is a development workaround.
-- Prefer using SERVICE_ROLE_KEY in the backend for better security.
CREATE POLICY "Enable anon update for verified payments" 
    ON public.taxes FOR UPDATE 
    TO anon
    USING ( status = 'unpaid' )
    WITH CHECK ( status = 'paid' );

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'taxes';
