import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is missing in .env!");
}

if (!serviceKey) {
  console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY is missing! Backend will use ANON_KEY, which is restricted by RLS.");
}

const supabase = createClient(supabaseUrl, serviceKey || anonKey);

if (!serviceKey && !anonKey) {
  throw new Error("Neither SERVICE_ROLE_KEY nor ANON_KEY found in .env!");
}
export default supabase;