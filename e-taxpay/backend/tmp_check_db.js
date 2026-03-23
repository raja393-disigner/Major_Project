import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function checkNotices() {
  const { data: notices, error: nError } = await supabase.from('notices').select('*')
  console.log('NOTICES:', notices)
  if (nError) console.error('Error fetching notices:', nError)

  const { data: users, error: uError } = await supabase.from('users').select('id, username, district')
  console.log('USERS:', users)
  if (uError) console.error('Error fetching users:', uError)
}

checkNotices()
